import { Injectable } from '@nestjs/common';
import * as convert from 'xml-js';

@Injectable()
export class XmlToJsonService {
  async convertXmlToJson(xmlData): Promise<any> {
    return convert.xml2json(xmlData, { compact: true, spaces: 4 });
  }
}
