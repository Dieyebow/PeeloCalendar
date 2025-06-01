
class  WhatsAppSender {
    constructor(phone_number_id, whatsapp_token) {
        this.phone_number_id = phone_number_id;
        this.whatsapp_token = whatsapp_token;
        this.api_version = 'v19.0';
        this.axios = require("axios").default

    }

 
    async sendCurlData(params) {
        const url = `https://graph.facebook.com/${this.api_version}/${this.phone_number_id}/messages?access_token=${this.whatsapp_token}`;
        
        try {
            const response = await this.axios({
                method: "POST",
                url: url,
                data: params,
                headers: { "Content-Type": "application/json" }
            });

            // Log success to MongoDB
            //await this.logToMongoDB(params);
            console.log('response Data done zer ===>',response.data)
            return response.data;
        } catch (error) {
            console.error('WhatsApp API Error:', error.response?.data || error);
            throw error.response?.data || error;
        }
    }

    async logToMongoDB(params) {
        try {
            await Mongo.connect();
            
            const condition = {
                user_phone_number: params.to
            };

            await Mongo.messageDialog(condition, {
                $push: {
                    flow: {
                        from: "bot",
                        message: params,
                        sent_at: new Date()
                    }
                },
                $set: {
                    update_date: new Date()
                }
            });
        } catch (error) {
            console.error('MongoDB logging error:', error);
        }
    }

    async sendModelMessage(sendTo, templateName, language = 'en_US', parameters = []) {
        const message = {
            messaging_product: "whatsapp",
            to: sendTo,
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: language
                },
                components: [
                    {
                        type: "body",
                        parameters: parameters
                    }
                ]
            }
        };
        console.log('sending done ===>',JSON.stringify(message));
       //return message
        return this.sendCurlData(message);
    }

    async sendModelMessageFlow(sendTo, templateName, language = 'en_US', parameters = []) {
        const message = {
            messaging_product: "whatsapp",
            to: sendTo,
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: language
                },
                components: [
                    {
                      "type": "button",
                      "sub_type": "flow",
                      "index": "0",
                      "parameters": [
                        {
                          "type": "action",
                          "action": {}
                        }
                      ]
                    }
                  ]
            }
        };
        console.log('sending done ===>',JSON.stringify(message));
       //return message
        return this.sendCurlData(message);
    }

    async sendBatchMessages(contacts, templateName, language = 'en_US', parameters = []) {
        const results = {
            success: [],
            failed: []
        };

        const batchSize = 10;
        for (let i = 0; i < contacts.length; i += batchSize) {
            const batch = contacts.slice(i, i + batchSize);
            
            const promises = batch.map(async (contact) => {
            try {
                    const result = await this.sendModelMessage(contact, templateName, language, parameters);
                    results.success.push({ contact, result });
                } catch (error) {
                    results.failed.push({ contact, error: error.message });
                }
            });

            await Promise.all(promises);
            
            // Add delay between batches
            if (i + batchSize < contacts.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return results;
    }


    async sendBatchMessagesFlow(contacts, templateName, language = 'en_US', parameters = []) {
        const results = {
            success: [],
            failed: []
        };

        const batchSize = 10;
        for (let i = 0; i < contacts.length; i += batchSize) {
            const batch = contacts.slice(i, i + batchSize);
            
            const promises = batch.map(async (contact) => {
            try {
                    const result = await this.sendModelMessageFlow(contact, templateName, language, parameters);
                    results.success.push({ contact, result });
                } catch (error) {
                    results.failed.push({ contact, error: error.message });
                }
            });

            await Promise.all(promises);
            
            // Add delay between batches
            if (i + batchSize < contacts.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return results;
    }
}

module.exports = WhatsAppSender;
