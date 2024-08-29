import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DomainsController } from './domains.controller';
import { NamecheapController } from 'src/namecheap/namecheap.controller';
import { NamecheapService } from 'src/namecheap/namecheap.service';
import { SendGridService } from 'src/sendgrid/sendgrid.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [DomainsController],
  providers: [NamecheapService, SendGridService],
  exports: [NamecheapService, SendGridService],
})
export class DomainsModule {}
