import { Module } from '@nestjs/common';
import { XmlToJsonController } from './xml-to-json.controller';
import { XmlToJsonService } from './xml-to-json.service';

@Module({
  controllers: [XmlToJsonController],
  providers: [XmlToJsonService],
  exports: [XmlToJsonService],
})
export class XmlToJsonModule {}
