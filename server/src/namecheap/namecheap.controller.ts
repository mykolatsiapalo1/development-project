import { Controller, Post, Body } from '@nestjs/common';
import { NamecheapService } from './namecheap.service';
import OpenAI from 'openai';

@Controller('namecheap')
export class NamecheapController {
  constructor(private readonly namecheapService: NamecheapService) {}

  @Post('check-domain')
  async checkDomainAvailability(@Body('domain') domain: string): Promise<any> {
    try {
      await this.namecheapService.checkDomainAvailability(domain);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('purchase-domain')
  async purchaseDomain(
    @Body() body: { domain: string; redirectTo: string },
  ): Promise<any> {
    try {
      const { domain, redirectTo } = body;
      const purchaseResponse =
        await this.namecheapService.purchaseDomain(domain);
      const dnsSetupResponse = await this.namecheapService.addARecord(
        domain,
        redirectTo,
      );
      return { success: true, purchaseResponse, dnsSetupResponse };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('setup-dns')
  async setupDnsRecord(
    @Body() body: { domain: string; ipAddress: string },
  ): Promise<any> {
    try {
      const { domain, ipAddress } = body;
      const dnsSetupResponse = await this.namecheapService.addARecord(
        domain,
        ipAddress,
      );
      return { success: true, dnsSetupResponse };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('available-domains')
  async getAvailableDomainsUnder20(
    @Body('domains') domains: string,
  ): Promise<any> {
    try {
      const availableDomains =
        await this.namecheapService.getAvailableDomainsUnder20(domains);

      return { success: true, availableDomains };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('generate-alias-names')
  async generateAliasNames(@Body('companyName') companyName: string = 'test') {
    return this.namecheapService.generateAliasNames(companyName);
  }

  @Post('purchase-domain-and-set-record')
  async purchaseDomainAndAddARecord(
    @Body('domain') domain: string,
  ): Promise<any> {
    return this.namecheapService.purchaseDomainAndAddARecord(domain);
  }

  @Post('send-message')
  async sendMessage(
    @Body('recipient') recipient: string,
    @Body('domain') domain: string,
  ): Promise<any> {
    return this.namecheapService.sendMessage(recipient, domain);
  }
}
