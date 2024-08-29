import { Module } from '@nestjs/common';
import { NamecheapService } from './namecheap.service';
import { NamecheapController } from './namecheap.controller';
import { HttpModule } from '@nestjs/axios';
import { XmlToJsonModule } from 'src/xml-to-json/xml-to-json.module';
import { XmlToJsonService } from 'src/xml-to-json/xml-to-json.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    XmlToJsonModule,
    CacheModule.register({
      ttl: 3600, // Cache TTL in seconds (1 hour)
      max: 100, // Maximum number of items in cache
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [NamecheapController],
  providers: [NamecheapService, XmlToJsonService, ConfigService],
  exports: [NamecheapService],
})
export class NamecheapModule {}
