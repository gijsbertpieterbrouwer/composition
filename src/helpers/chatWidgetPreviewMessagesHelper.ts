import { ChatWidgetActionRequest, ChatWidgetStylingSettingsData, ChoiceOptionData, CommunicationDirection, ReplyOptionType } from "@/TickApi";
import { dateToTicks } from "./dateHelper";

export function getChatwidgetFontOptions(): {
  text: string;
  value: string | number;
}[] {
  return [
    {
      text: 'Tick',
      value: "'Outfit', sans-serif",
    },
    {
      text: 'Abril Fatface',
      value: "'Abril Fatface', Georgia, 'Times New Roman', serif;",
    }, {
      text: 'Alegreya',
      value: "Alegreya, Helvetica, Arial, Verdana, sans-serif",
    },
    {
      text: 'Alegreya Sans',
      value: '"Alegreya Sans", Georgia, "Times New Roman"',
    },
    {
      text: 'Anton',
      value: 'Anton, Helvetica, Arial, Verdana, sans-serif',
    },
    // {
    //   text: 'Arial',
    //   value: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    // },
    {
      text: 'Arimo',
      value: 'Arimo, Arial, "Helvetica Neue", Helvetica, sans-serif',
    },
    {
      text: 'Arvo',
      value: 'Arvo, Courier, Georgia, serif',
    },
    {
      text: 'Catamaran',
      value: 'Catamaran, sans-serif',
    },
    {
      text: 'Comic Neue',
      value: '"Comic Neue","Comic Sans MS", "Marker Felt-Thin", Arial, sans-serif',
    },
    {
      text: 'Courier New',
      value: '"Courier Prime","Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace',
    },
    {
      text: 'Della Respira',
      value: '"Della Respira", serif;',
    },
    {
      text: 'DM Sans',
      value: '"DM Sans", sans-serif;',
    },
    // {
    //   text: 'Georgia',
    //   value: 'Georgia, Times, "Times New Roman", serif',
    // },
    {
      text: 'Gilda Display',
      value: '"Gilda Display", serif',
    },
    // {
    //   text: 'Helvetica',
    //   value: '"Helvetica Neue", Helvetica, Arial, Verdana, sans-serif',
    // },
    {
      text: 'Lora',
      value: 'Lora, Georgia, "Times New Roman", serif',
    },
    // {
    //   text: 'Lucida',
    //   value: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
    // },
    {
      text: 'Marcellus',
      value: 'Marcellus, serif',
    },
    {
      text: 'Merriweather',
      value: 'Merriweather, Georgia, "Times New Roman", serif',
    },
    {
      text: 'Neuton',
      value: 'Neuton, serif',
    },
    {
      text: 'Noticia Text',
      value: '"Noticia Text", Georgia, "Times New Roman", serif',
    },
    {
      text: 'Noto Sans',
      value: '"Noto Sans", Helvetica, sans-serif',
    },
    {
      text: 'Open Sans',
      value: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    {
      text: 'Playfair Display',
      value: '"Playfair Display", Georgia, "Times New Roman", serif',
    },
    {
      text: 'Raleway',
      value: 'Raleway, sans-serif',
    },
    {
      text: 'Recursive',
      value: 'Recursive, sans-serif',
    },
    {
      text: 'Roboto',
      value: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    {
      text: 'Source Sans Pro',
      value: '"Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    {
      text: 'Source Code Pro',
      value: '"Source Code Pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    {
      text: 'Space Mono',
      value: '"Space Mono", Courier, Georgia, serif',
    },
    {
      text: 'Syncopate',
      value: 'Syncopate, "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    {
      text: 'Work Sans',
      value: '"Work Sans", sans-serif',
    },
  ]

}


export function getChatwidgetFontSizeOptions(): {
  text: string;
  value: string | number;
}[] {
  return [
    {
      text: '12',
      value: "12",
    },
    {
      text: '13',
      value: "13",
    },
    {
      text: '14',
      value: "14",
    },
    {
      text: '15',
      value: '15',
    },
    {
      text: '16',
      value: '16',
    }
    ,
    {
      text: '17',
      value: '17',
    }
    ,
    {
      text: '18',
      value: '18',
    }
    ,
    {
      text: '19',
      value: '19',
    }
    ,
    {
      text: '20',
      value: '20',
    }
  ]

}

export function generateBorderRadius(value: number | ChatWidgetStylingSettingsData, factor?: number): string {
  let valIsNumeric = typeof value === 'number';
  const stylingData = value as ChatWidgetStylingSettingsData;

  if (!valIsNumeric && (stylingData && (stylingData.borderRadius_Linked || stylingData.borderRadius_LeftTop == null))) {
    valIsNumeric = true;
    value = stylingData.borderRadius ?? 0;
  }

  if (!value || valIsNumeric) {
    let radius = value as number || 0
    if (radius > 0) { radius = radius / 20; }

    if (factor) {
      radius = radius * factor;
    }

    return `${radius}vmin`;
  } else {

    return stylingData.borderRadius_Linked
      ? generateBorderRadius(stylingData?.borderRadius ?? 0)
      : `${generateBorderRadius(stylingData?.borderRadius_LeftTop ?? 0)} ${generateBorderRadius(stylingData?.borderRadius_RightTop ?? 0)} ${generateBorderRadius(stylingData?.borderRadius_RightBottom ?? 0)} ${generateBorderRadius(stylingData?.borderRadius_LeftBottom ?? 0)}`
  }
}


export function getChatWidgetDummyWidgetId() {
  return "preview_me"
}

export function getChatWidgetDummyPreviewMessages(): ChatWidgetActionRequest[] {

  const returnOption1: ChoiceOptionData = {
    text: "Get a refund",
    value: "1"
  }
  const returnOption2: ChoiceOptionData = {
    text: "Speak to a person",
    value: "2"
  }


  const feedbackOption1: ChoiceOptionData = {
    text: "Human",
    value: "1"
  }
  const feedbackOption2: ChoiceOptionData = {
    text: "Bot",
    value: "2"
  }
  const feedbackOption3: ChoiceOptionData = {
    text: "Tickly",
    value: "3"
  }


  const sentDate = new Date();
  const sentDateTicks = dateToTicks(new Date());

  return [
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Inbound,
      from: getChatWidgetDummyWidgetId(),
      messageId: "1",
      ticketId: "A",
      messageHtml: "I would want to return the socks I have ordered",
      senderInfo: {
        name: "Me",
        avatarUrl: null,
        senderId: "me",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Outbound,
      from: "T",
      messageId: "2",
      ticketId: "A",
      messageHtml: "I will take a look it, could you give me the order number?",
      senderInfo: {
        name: "Tickly",
        avatarUrl: null,
        senderId: "t",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Inbound,
      from: getChatWidgetDummyWidgetId(),
      messageId: "3",
      ticketId: "A",
      messageHtml: "The e-mail says it is 931768",
      senderInfo: {
        name: "Me",
        avatarUrl: null,
        senderId: "me",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Outbound,
      from: "T",
      messageId: "4",
      ticketId: "A",
      messageHtml: "I found the order, what would you like to do?",
      replyOptions: [
        {
          type: ReplyOptionType.ChoiceOption,
          data: JSON.stringify(returnOption1)
        },
        {
          type: ReplyOptionType.ChoiceOption,
          data: JSON.stringify(returnOption2)
        },
      ],
      senderInfo: {
        name: "Tickly",
        avatarUrl: null,
        senderId: "t",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Inbound,
      from: getChatWidgetDummyWidgetId(),
      messageId: "5",
      ticketId: "A",
      messageHtml: "refund",
      senderInfo: {
        name: "Me",
        avatarUrl: null,
        senderId: "me",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Outbound,
      from: "T",
      messageId: "6",
      ticketId: "A",
      messageHtml: "Can you confirm you didn't wear the socks?",
      senderInfo: {
        name: "Tickly",
        avatarUrl: null,
        senderId: "t",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Inbound,
      from: getChatWidgetDummyWidgetId(),
      messageId: "7",
      ticketId: "A",
      messageHtml: "Oops, no . I did wear them at the wedding of my sister. While I was there I saw my brother in law with exactly the same socks which made me feel really uncomfortable, therefore returning the socks. ",
      senderInfo: {
        name: "Me",
        avatarUrl: null,
        senderId: "me",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Outbound,
      from: "T",
      messageId: "8",
      ticketId: "A",
      messageHtml: "O no! what a shame he did that to you.. You knwo what? We will take back the socks anyways, we need to right this wrong.",
      senderInfo: {
        name: "Tickly",
        avatarUrl: null,
        senderId: "t",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Inbound,
      from: getChatWidgetDummyWidgetId(),
      messageId: "9",
      ticketId: "A",
      messageHtml: "Thank you, this is one of the most heartwarming conversations I have ever had! Can I ask.. are you really human?",
      senderInfo: {
        name: "Me",
        avatarUrl: null,
        senderId: "me",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Outbound,
      from: "T",
      messageId: "10",
      ticketId: "A",
      messageHtml: "I just emailed the return instructions to you e-mail address. Have a great day! ;)",
      senderInfo: {
        name: "Tickly",
        avatarUrl: null,
        senderId: "t",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Outbound,
      from: "T",
      messageId: "11",
      ticketId: "A",
      messageHtml: "Now the trick question.. what am I?",
      replyOptions: [
        {
          type: ReplyOptionType.ChoiceOption,
          data: JSON.stringify(feedbackOption1)
        },
        {
          type: ReplyOptionType.ChoiceOption,
          data: JSON.stringify(feedbackOption2)
        },
        {
          type: ReplyOptionType.ChoiceOption,
          data: JSON.stringify(feedbackOption3)
        },
      ],
      senderInfo: {
        name: "Tickly",
        avatarUrl: null,
        senderId: "t",
      }
    }, {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Inbound,
      from: getChatWidgetDummyWidgetId(),
      messageId: "12",
      ticketId: "A",
      messageHtml: "Tickly, it must be.. you are awesome!",
      senderInfo: {
        name: "Me",
        avatarUrl: null,
        senderId: "t",
      }
    },
    {
      sentDate: sentDate,
      sentDateAsTick: sentDateTicks,
      chatWidgetId: "preview",
      direction: CommunicationDirection.Outbound,
      from: "T",
      messageId: "13",
      ticketId: "A",
      messageHtml: "🆃🅷🅰🅽🆇",
      senderInfo: {
        name: "Tickly",
        avatarUrl: null,
        senderId: "t",
      }
    },
  ]

}