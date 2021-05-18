function sendText(chat_id, text, keyboard) { // функция, необходимая для отправки сообщений
  let data = {
    method : "post",
    payload: {
      method : "sendMessage",
      chat_id : String(chat_id),
      text : text,
      parse_mode : "HTML",
      reply_markup : JSON.stringify(keyboard)
    }
  }
  let url = "SET_API_URL";
  let response = UrlFetchApp.fetch(url, data);
}

function sendImage(chat_id, photo, keyboard) { // функция, необходимая для отправки изображений в диалоге
  let img = {
    method : "post",
    payload: {
      method : "sendPhoto",
      chat_id : String(chat_id),
      photo : photo,
      reply_markup : JSON.stringify(keyboard)
    }
  }
  let url = "https://api.telegram.org/bot1778494560:AAHoJVYA9VDqv0CiXwLDxceZf34grE1GN5s/";
  let response = UrlFetchApp.fetch(url, img);
}

function setWebhook() { // функция, с помощью которой мы загружаем наш код на сервера google
  const webappurl = "SET_GOOGLE_WEBHOOK";
  let url = "SET_API_URL";
  let response = UrlFetchApp.fetch(url + "?url=" + webappurl);
  Logger.log(response);
}
