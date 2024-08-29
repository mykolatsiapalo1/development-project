import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { XmlToJsonService } from 'src/xml-to-json/xml-to-json.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
const sgMail = require('@sendgrid/mail');

@Injectable()
export class NamecheapService {
  private readonly apiKey = '434266cc53c25075c880cf';
  private readonly apiUsername = 'meetzai';
  private readonly clientIp = '194.44.136.166';
  private readonly uid = 'meetz_ai_domain';
  private readonly pw =
    'XOBUVHHUPOUGGM2PSLOW6IFCTJW5MZ6HKYEXMYUG' ||
    'GNQCTT52FMSB6R3UPQWBYCANFL22SYLMCDN4PJB6';
  private openai: OpenAI;

  constructor(
    private readonly httpService: HttpService,
    private readonly xmltoJsonService: XmlToJsonService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async checkDomainAvailability(domain: string): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.get('https://reseller.enom.com/interface.asp', {
        params: {
          command: 'check',
          UID: this.uid,
          PW: this.pw,
          SLD: domain.split('.')[0],
          TLD: domain.split('.')[1],
          responsetype: 'json',
          version: 2,
          includeprice: 1,
        },
      }),
    );

    // console.log(response.data['interface-response']);
    const success =
      response.data['interface-response'].Domains.Domain.RRPCode === '210';
    const message = response.data['interface-response'].Domains.Domain.RRPText;
    if (!success) {
      throw new Error(message);
    }
  }

  async purchaseDomain(domain: string): Promise<any> {
    const { data } = await lastValueFrom(
      this.httpService.get('https://reseller.enom.com/interface.asp', {
        params: {
          command: 'Purchase',
          UID: this.uid,
          PW: this.pw,
          SLD: domain.split('.')[0],
          TLD: domain.split('.')[1],
          responsetype: 'json',
          version: 2,
          includeprice: 1,
          NumYears: 1,
          UseDNS: 'default',
          ContactEmail: 'tom@meetz.ai',
          RegistrantFirstName: 'Tom',
          RegistrantLastName: 'Ram',
          RegistrantAddress1: '27 Vered str.',
          RegistrantCity: 'Lehavim',
          RegistrantStateProvince: 'South',
          RegistrantPostalCode: '8533800',
          RegistrantCountry: 'Israel',
          RegistrantPhone: '+972.585010596',
          RegistrantEmailAddress: 'tom@meetz.ai',
        },
      }),
    );

    if (data['interface-response'].RRPCode === '200') {
      console.log(`Domain ${domain} registered successfully.`);
      return {
        success: true,
        message: `Domain ${domain} registered successfully.`,
      };
    } else {
      const error = data['interface-response'].Err1;
      console.error(`Failed to register domain: ${error}`);
      return { success: false, message: `Failed to register domain: ${error}` };
    }
  }

  async addARecord(domain: string, ipAddress: string): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.get('https://api.namecheap.com/xml.response', {
        params: {
          ApiUser: this.apiUsername,
          ApiKey: this.apiKey,
          UserName: this.apiUsername,
          Command: 'namecheap.domains.dns.setHosts',
          DomainName: domain,
          ClientIp: this.clientIp,
          HostName1: '@',
          RecordType1: 'A',
          Address1: ipAddress,
        },
      }),
    );
    return response.data;
  }

  async getDomainPricing(domains: string): Promise<any> {
    const domainsArray = domains.split(',');
    const domainsPricing = [];

    for (const domain of domainsArray) {
      const response = await lastValueFrom(
        this.httpService.get('https://reseller.enom.com/interface.asp', {
          params: {
            command: 'check',
            UID: this.uid,
            PW: this.pw,
            SLD: domain.split('.')[0],
            TLD: domain.split('.')[1],
            responsetype: 'json',
            version: 2,
            includeprice: 1,
          },
        }),
      );

      const priceRegistration =
        response.data['interface-response'].Domains.Domain.Prices.Registration;

      if (priceRegistration && +priceRegistration <= 20) {
        domainsPricing.push({
          domain,
          price: priceRegistration,
        });
      }
    }

    console.log('domainsPricing', domainsPricing);

    return domainsPricing;
  }

  async getAvailableDomainsUnder20(domains: string): Promise<any> {
    return await this.getDomainPricing(domains);
  }

  async generateAliasNames(companyName: string) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: `Return an array of 15 company names (no spaces in each company name) that are very similar to this company name: "${companyName}"`,
        },
      ],
    });
    if (
      completion?.choices?.length &&
      completion?.choices[0]?.message?.content
    ) {
      const aliasCoNames = completion?.choices[0]?.message?.content?.trim();
      console.log('aliasCoNames', aliasCoNames);
    }
  }

  async purchaseDomainAndAddARecord(domain: string): Promise<any> {
    console.log('domain', domain);

    // Step 1: Purchase the domain
    const purchaseResponse = await lastValueFrom(
      this.httpService.get('https://resellertest.enom.com/interface.asp', {
        params: {
          command: 'Purchase',
          UID: this.uid,
          PW: process.env.TEST_TOKEN || this.pw,
          SLD: domain.split('.')[0],
          TLD: domain.split('.')[1],
          responsetype: 'xml',
          NumYears: 1,
          EndUserIP: '194.44.136.166',
          UseDNS: 'default',
          RegistrantFirstName: 'Tom',
          RegistrantLastName: 'Ram',
          RegistrantAddress1: '27 Vered str.',
          RegistrantCity: 'Lehavim',
          RegistrantStateProvince: 'South',
          RegistrantPostalCode: '8533800',
          RegistrantCountry: 'Israel',
          RegistrantPhone: '+972.585010596',
          RegistrantEmailAddress: 'tom@meetz.ai',
        },
      }),
    );

    const purchaseResult = await this.xmltoJsonService.convertXmlToJson(
      purchaseResponse.data,
    );
    const parsedPurchaseResult = JSON.parse(purchaseResult);

    // console.log(parsedPurchaseResult);

    // Check if the domain was successfully purchased
    if (parsedPurchaseResult['interface-response'].RRPCode?._text === '200') {
      console.log(`Domain ${domain} purchased successfully.`);
      let domainId;
      try {
        const response = await lastValueFrom(
          this.httpService.post(
            'https://api.sendgrid.com/v3/whitelabel/domains',
            {
              domain,
              subdomain: 'mail',
              automatic_security: true,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        );

        console.log('Domain Authentication:', response.data);
        domainId = response.data.id;
      } catch (error) {
        console.error(
          'Error authenticating domain:',
          error.response?.data || error.message,
        );
      }

      // Step 2: Add A record to redirect to meetz.ai

      const dnsSetupResponse = await lastValueFrom(
        this.httpService.get('https://resellertest.enom.com/interface.asp', {
          params: {
            command: 'sethosts',
            UID: this.uid,
            PW: process.env.TEST_TOKEN || this.pw,
            SLD: domain.split('.')[0],
            TLD: domain.split('.')[1],
            HostName1: '@',
            HostName2: '@',
            RecordType1: 'URL',
            RecordType2: 'A',
            Address1: 'https://www.meetz.ai',
            Address2: '194.44.136.166',
            TTL1: '60',
            responsetype: 'xml',
          },
        }),
      );

      const dnsResult = await this.xmltoJsonService.convertXmlToJson(
        dnsSetupResponse.data,
      );
      const parsedDnsResult = JSON.parse(dnsResult);

      if (parsedDnsResult['interface-response'].ErrCount._text === '0') {
        console.log(
          `A record added successfully to ${domain}, redirecting to meetz.ai.`,
        );
        try {
          const response = await lastValueFrom(
            this.httpService.post(
              `https://api.sendgrid.com/v3/whitelabel/domains/${domainId}/validate`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                  'Content-Type': 'application/json',
                },
              },
            ),
          );
          console.log('Domain Validation:', response.data);
        } catch (error) {
          console.error(
            'Error verifying domain:',
            error.response?.data || error.message,
          );
        }

        return {
          success: true,
          message: `Domain ${domain} purchased and A record set.`,
        };
      } else {
        console.error(`Failed to set A record for ${domain}.`);
        return {
          success: false,
          message: `Domain purchased but failed to set A record.`,
        };
      }
    } else {
      console.error(`Failed to purchase domain ${domain}.`);
      console.log(parsedPurchaseResult['interface-response'].errors);
      return {
        success: false,
        message: `Failed to purchase domain ${domain}.`,
      };
    }
  }

  async sendMessage(recipient: string, domain: string) {
    const msg = {
      to: recipient,
      from: `test@domain.com`,
      subject: 'Test Email',
      text: 'This is a test email sent from SendGrid API.',
      html: '<strong>This is a test email sent from SendGrid API.</strong>',
    };
    try {
      await sgMail.send(msg);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error(
        'Error sending email:',
        error.response?.body || error.message,
      );
    }
  }
}
