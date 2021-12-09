import {assert} from 'chai';
import {Chance} from 'chance';
import {Buffer} from 'buffer';
import EJSTemplate from "../../EJSTemplate";
import {DummyTransport, TemplateData, TransportData} from "../common";
import Notifications from '../../Notifications';
import * as chance from "chance";

describe('Notifications', async function  () {
  const ejsTemplate = `<h1><%= data.userId %></h1>`;
  let template: EJSTemplate<TemplateData>;
  let transport: DummyTransport;
  before(function () {
    template = new EJSTemplate<TemplateData>(
      'DummyTemplate', ejsTemplate
    );
  });


  describe('registerTransport', function () {
    it('should register transport with handler', function () {
      const not = new Notifications();
      const transport = new DummyTransport((x: any) => x);
      not.registerTransport(transport);

      assert.isTrue(
          not.transports.has(transport.name)
      );
    });
  });



  describe('registerTemplate', function () {
    it('should register template with handler', function () {
      const not = new Notifications();
      const transport = new DummyTransport((x: any) => x);
      not.registerTransport(transport);
      not.registerTemplate(template, [
        'DummyTransport'
      ]);

      assert.isTrue(
          not.templates.has(`${template.name}.${transport.name}`)
      );
    });
  });


  describe('unregisterTemplate', function () {
    it('should unregister transport with handler', function () {
      const not = new Notifications();
      const transport = new DummyTransport((x: any) => x);
      not.registerTransport(transport);
      assert.isTrue(
          not.transports.has(transport.name)
      );

      not.unregisterTransport(transport.name);
      assert.isFalse(
          not.transports.has(transport.name)
      );
    });
  });

  describe('unregisterTransport', function () {
    it('should unregister template with handler', function () {
      const not = new Notifications();
      const transport = new DummyTransport((x: any) => x);
      not.registerTransport(transport);
      not.registerTemplate(template, [
        'DummyTransport'
      ]);

      assert.isTrue(
          not.templates.has(`${template.name}.${transport.name}`)
      );

      not.unregisterTemplate(template.name, transport.name);
      assert.isFalse(
          not.templates.has(`${template.name}.${transport.name}`)
      );
    });
  });

  describe('notify', function() {
    it('should produce a notification with given params', async function () {
      const not = new Notifications<any>();
      const transport = new DummyTransport((x: any) => x);
      not.registerTransport(transport);
      not.registerTemplate(template, [
        'DummyTransport'
      ]);
      const chance = new Chance();

      const data = { userId: chance.string() };
      const to = chance.string();
      const from = chance.string();

      const output = await new Promise<TransportData>((resolve, reject) => {
        transport.cb = resolve;

        not.notify([
          { to, from, transportName: transport.name  }
        ], {
          data,
          templateName: template.name
        })
      });

      assert.equal(output.address.to, to);
      assert.equal(output.address.from, from);
      const testCase = require('ejs').render(ejsTemplate, {data});
      assert.deepEqual(output.payload, {
        content: Buffer.from(testCase, 'utf8')
      });
    });
  });
});
