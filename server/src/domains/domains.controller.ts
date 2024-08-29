import { Controller, Post, Body } from '@nestjs/common';
import { NamecheapService } from 'src/namecheap/namecheap.service';
import { SendGridService } from 'src/sendgrid/sendgrid.service';

@Controller('domains')
export class DomainsController {
  constructor(
    private readonly namecheapService: NamecheapService,
    private readonly sendGridService: SendGridService,
  ) {}

  @Post('purchase')
  async purchaseAndSetupDomain(@Body() body: any): Promise<any> {
    const { domain, redirectTo, emails } = body;

    const availability = await this.namecheapService.checkDomainAvailability(domain);
    console.log("availability", availability)
    if (availability.available) {
      const purchaseResponse = await this.namecheapService.purchaseDomain(domain);
      await this.namecheapService.addARecord(domain, redirectTo);

      const authResponse = await this.sendGridService.authenticateDomain(domain);
      const domainId = authResponse.id;
      await this.sendGridService.verifyDomain(domainId);

      const emailResponses = await Promise.all(
        emails.map((email) => this.sendGridService.createEmail(`noreply@${domain}`, email)),
      );

      return { success: true, purchaseResponse, emailResponses };
    } else {
      return { success: false, message: 'Domain is not available.' };
    }
  }
}
