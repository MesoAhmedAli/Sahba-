import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export interface MessageOptions {
  to: string;
  message: string;
  type: 'sms' | 'whatsapp';
}

export class MessagingService {
  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: to
      });
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    try {
      // Format WhatsApp number
      const whatsappTo = `whatsapp:${to}`;
      const whatsappFrom = `whatsapp:${process.env.TWILIO_PHONE_NUMBER!}`;
      
      await client.messages.create({
        body: message,
        from: whatsappFrom,
        to: whatsappTo
      });
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  async sendEventInvitation(phoneNumbers: string[], eventTitle: string, eventDate: string, eventLocation?: string): Promise<void> {
    const message = `You're invited to "${eventTitle}" on ${eventDate}${eventLocation ? ` at ${eventLocation}` : ''}. Check Sahba app for details!`;
    
    for (const phone of phoneNumbers) {
      await this.sendSMS(phone, message);
    }
  }

  async sendEventReminder(phoneNumbers: string[], eventTitle: string, hoursUntil: number): Promise<void> {
    const message = `Reminder: "${eventTitle}" starts in ${hoursUntil} hours. Don't forget to check the latest updates in Sahba!`;
    
    for (const phone of phoneNumbers) {
      await this.sendSMS(phone, message);
    }
  }

  async sendWeddingUpdate(phoneNumbers: string[], updateMessage: string): Promise<void> {
    const message = `Wedding Update: ${updateMessage} - Check Sahba for more details.`;
    
    for (const phone of phoneNumbers) {
      await this.sendWhatsApp(phone, message);
    }
  }
}

export const messagingService = new MessagingService();