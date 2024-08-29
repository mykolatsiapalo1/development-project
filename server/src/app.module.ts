import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NamecheapModule } from './namecheap/namecheap.module';
import { DomainsModule } from './domains/domains.module';
import { XmlToJsonModule } from './xml-to-json/xml-to-json.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NamecheapModule,
    // DomainsModule,
    XmlToJsonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
