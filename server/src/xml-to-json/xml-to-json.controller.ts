import { Controller, Post, Body } from '@nestjs/common';
import { XmlToJsonService } from './xml-to-json.service';

@Controller('xml') //redirects our route to http://localhost:3000/xml
export class XmlToJsonController {
  constructor(private readonly xmlToJsonService: XmlToJsonService) {}

  @Post()
  async convertXmlToJson(@Body() xmlData): Promise<any> {
    return this.xmlToJsonService.convertXmlToJson(xmlData);
  }
}
