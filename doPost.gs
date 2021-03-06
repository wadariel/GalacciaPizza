function doPost(e) {
  let contents = JSON.parse(e.postData.contents); // получаем информацию о сообщении и отправителе для дальнейшей работы с кодом
  SpreadsheetApp.getActive().getSheetByName("Debug").getRange(1, 1).setValue(JSON.stringify(contents, null, 7)); // вводим в системную таблицу получение значение для мониторинга сообщений
  if (contents.message) { // если мы нажимаем на кнопку с клавиатуры снизу, то будет срабатывать данное условие
    let chat_id = contents.message.from.id; // получаем chat_id отправителя для данного условия
    let firstName = contents.message.from.first_name; // получаем имя отправителя, указанное в профиле
    let text = contents.message.text; // получаем значение кнопки клавиатуры
    let rowsTemp = SpreadsheetApp.getActive().getSheetByName("temp").getLastRow() + 1; // получаем количество строк в temp без первой строки для ввода имени
    let rowsOrd = SpreadsheetApp.getActive().getSheetByName("заказы").getLastRow() + 1; // получаем то же в заказах
    let lastTemp = SpreadsheetApp.getActive().getSheetByName("temp").getLastRow() - 1; // получаем последнюю строку в таблице temp для работы с переменной status
    if (lastTemp < 1) lastTemp = 1;
    let tempNames = SpreadsheetApp.getActive().getSheetByName("temp").getRange(2, 1, lastTemp).getValues().flat(); // получаем список делающих заказ, чтобы определить необходимое нам поле
    let rowInv = tempNames.indexOf(firstName) + 2; // находим необходимое нам поле для ввода 
    let status = SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 4).getValue();
    let commands = ["/start", "Показать меню", "Описание пиццерии", "Вернуться назад", "Продолжить", "Да, подтвердить заказ", "Нет, очистить корзину"];
    let des = SpreadsheetApp.getActive().getSheetByName("описание").getRange(2, 1, 1, 4).getValues().flat(); // для пункта описание отбираем описание пиццерии с контактами и картинкой (и приводим всё это в одномерный массив)
    

    if (text === "/start") { // начало взаимодействия с пользователем
      SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowsTemp, 1).setValue(firstName); // устанавливаем имя в переменную таблицу для дальнейшего взаимодействия со строкой для конкретного пользователя
      sendText(chat_id, "Здравствуйте, " + firstName + "! Я бот-помощник пиццерии Галацция. \n" + "Инструкция: \n\nПожалуйста, пользуйтесь ботом СТРОГО по предлагаемым в клавиатуре командам, если только в сообщении не просится самим внести данные.", startKeyboard);
      SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowsTemp, 4).setValue("start"); //  данная ячейка в переменной таблице нам нужна для сохранения последовательности действий при заказе и исключения возможности появления ошибок, связанных с вводом некорректных данных
      return;
    }

    if (text === "Показать меню" && status === "start"){ // одна из первых кнопок взаимодействия (основной алгоритм выолняется после данной кнопки), вторая часть нужна для проверки соответствия хронологии заказа
      let myRow = SpreadsheetApp.getActive().getSheetByName("товары").getLastRow() - 1; // берём количество строк в таблице товаров
      let menu = SpreadsheetApp.getActive().getSheetByName("товары").getRange(2, 1, myRow, 5).getValues(); // отбираем все ячейки с товарами
      sendText(chat_id, "Ниже предоставлено наше меню. Нажмите на размер под фотографией пиццы или напитка, чтобы добавить это в свой заказ. \n"); 
      for (let i = 0; i < myRow; i+=4) { // цикл для создания inline-клавиатур для каждого пункта меню отдельно
        sendText(chat_id, `<b>${menu[i][0]}</b>` + "\n" + menu[i][1] + "\n", backKeyboard);
        let updchoiceKeyboard = { inline_keyboard :
            [[
              {text: menu[i+1][0]+ "/" + menu[i+1][2] + "/" + menu[i+1][4] + "руб.", callback_data : menu[i][0] + " " + menu[i+1][0]}, {text: menu[i+1][0]+ "/" + menu[i+2][2] + "/"+ menu[i+2][4] + "руб.", callback_data : menu[i][0] + " " + menu[i+1][0]}
            ],
          [
            {text: menu[i+1][0]+ "/" + menu[i+3][2] + "/" + menu[i+3][4] + "руб.", callback_data : menu[i][0] + " " + menu[i+1][0]}
          ]]
        }        
        sendImage(chat_id, menu[i][3], updchoiceKeyboard);
      }
      SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 4).setValue("menu");
    }


    if (text === "Описание пиццерии" && status === "start") {
      sendText(chat_id, des[0] + "\n\nНаш адрес: \n" + des[1] + "\n\nНомер телефона: \n" + des[2], urlKeyboard);
      sendImage(chat_id, des[3], backKeyboard);
      SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 4).setValue("des");
      return;
    }

    if (text === "Вернуться назад" && status === "des") {
      sendText(chat_id, "Выберите интересующий вас раздел.", startKeyboard);
      SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 4).setValue("start");
      return;
    }

    if (text === "Продолжить" && status === "menu") {
      let indexTemp = SpreadsheetApp.getActive().getSheetByName("temp").getRange(2, 1, rowsTemp).getValues().flat().indexOf(firstName); // получаем номер строки с именем заказавшего
      let order = SpreadsheetApp.getActive().getSheetByName("temp").getRange(indexTemp + 2, 3).getValue();
      let price = SpreadsheetApp.getActive().getSheetByName("temp").getRange(indexTemp + 2, 2).getValue();
      sendText(chat_id, "Вот ваш список заказанного: \n" + order + "\nИтого:\n" + price + "\nПодтвердить заказ?", yesnoKeyboard);
      SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 4).setValue("go");
    }
    

    if (text === "Да, подтвердить заказ" && status === "go"){
      sendText(chat_id, "Пожалуйста, введите ваш адрес.", removeKeyboard);
      SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 4).setValue("yes");
      SpreadsheetApp.getActive().getSheetByName("заказы").getRange(rowsOrd, 1).setValue(firstName); // устанавливаем имя в ячейку заказов для дальнейшего взаимодействия со строкой для конкретного пользователя
    }    

    if (text === "Нет, очистить корзину" && status === "go"){
      sendText(chat_id, "\nВаша корзина очищена, можете заполнить её заново\n", startKeyboard);
      let indexTemp = SpreadsheetApp.getActive().getSheetByName("temp").getRange(2, 1, rowsTemp).getValues().flat().indexOf(firstName); // получаем номер строки с именем заказавшего
      if (indexTemp > 0) {
        SpreadsheetApp.getActive().getSheetByName("temp").deleteRow(indexTemp + 2);
        SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowsTemp, 1).setValue(firstName);      
      }
      SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 4).setValue("start");
      return;
    }

    if (contents.message.from.first_name === firstName && commands.indexOf(text) < 0 && contents.message.text && status === "yes") {
      let indexOrd = SpreadsheetApp.getActive().getSheetByName("заказы").getRange(2, 1, rowsOrd).getValues().flat().indexOf(firstName);
      SpreadsheetApp.getActive().getSheetByName("заказы").getRange(indexOrd + 2, 5).setValue(text);
      sendText(chat_id, "Теперь последнее - нам нужен ваш номер телефона для связи. Используйте кнопку ниже для отправки номера из телеграмма.", phoneKeyboard);
      SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 4).setValue("end");
      return;
    }

    if (contents.message.contact && status === "end"){
      let phone = contents.message.contact.phone_number;
      let indexTemp = SpreadsheetApp.getActive().getSheetByName("temp").getRange(2, 1, rowsTemp).getValues().flat().indexOf(firstName); // получаем номер строки с именем заказавшего
      let indexOrd = SpreadsheetApp.getActive().getSheetByName("заказы").getRange(2, 1, rowsOrd).getValues().flat().indexOf(firstName); // то же, но в заказах
      let order = SpreadsheetApp.getActive().getSheetByName("temp").getRange(indexTemp + 2, 3).getValue();
      let price = SpreadsheetApp.getActive().getSheetByName("temp").getRange(indexTemp + 2, 2).getValue();
      SpreadsheetApp.getActive().getSheetByName("заказы").getRange(indexOrd + 2, 2).setValue(price);
      SpreadsheetApp.getActive().getSheetByName("заказы").getRange(indexOrd + 2, 3).setValue(order);
      SpreadsheetApp.getActive().getSheetByName("заказы").getRange(indexOrd + 2, 4).setValue(phone);
      sendText(chat_id, "Готово! Ваш заказ начал готовиться! Ожидайте доставку в течении часа! Для связи можете использовать наш номер телефона: " + des[2], removeKeyboard);
      SpreadsheetApp.getActive().getSheetByName("temp").deleteRow(indexTemp + 2);
      return;
    }

    if (commands.indexOf(text) < 0 && contents.message.text && status != "yes"){
      sendText(chat_id, "Пожалуйста, следуйте алгоритму. Если у вас возникли проблемы, свяжитесь с нашим оператором: \n 8(800)555-35-35");
      return;
    }
   
  } 


  if (contents.callback_query){
    let data = contents.callback_query.data; // получаем значение кнопки клавиатуры
    let chat_id = contents.callback_query.message.chat.id; // получаем chat_id отправителя
    let firstName = contents.callback_query.from.first_name; // получаем имя отправителя, указанное в профиле
    let lastTemp = SpreadsheetApp.getActive().getSheetByName("temp").getLastRow() - 1; // получаем последнюю строку в таблице temp для дальнейшего расчёта
    let tempNames = SpreadsheetApp.getActive().getSheetByName("temp").getRange(2, 1, lastTemp).getValues().flat(); // получаем список делающих заказ, чтобы определить необходимое нам поле
    let rowInv = tempNames.indexOf(firstName) + 2; // находим необходимое нам поле для ввода 
    let myRow = SpreadsheetApp.getActive().getSheetByName("товары").getLastRow() - 1; // находим количество строк в таблице заказов 
    let listPr = SpreadsheetApp.getActive().getSheetByName("товары").getRange(3, 5, myRow).getValues().flat(); // собираем все цены товаров (из таблицы заказов)
    let listId = SpreadsheetApp.getActive().getSheetByName("товары").getRange(3, 2, myRow).getValues().flat(); // определяем наименование товаров для определения цены для выбранного товара
    let price = listPr[listId.indexOf(data)]; // определяем цену выбранного товара 
    let orderTemp = SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 3).getValue(); // находим значение заказа для добавление новых элементов в ячейку
    let priceTemp = SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 2).getValue(); // то же, но с ценой
    let orders = `${data} | ${orderTemp}`; // определяем новое значение для ввода в ячейку с новыми заказами
    let prices = price + priceTemp; // определяем итоговую цену
    SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 2).setValue(prices); // устанавливаем в temp цену
    SpreadsheetApp.getActive().getSheetByName("temp").getRange(rowInv, 3).setValue(orders); // устанавливаем туда же наименования товаров
    sendText(chat_id, "Добавлено в корзину: " + data + " - " + price + " рублей", nextKyboard); // сообщаем пользователю о выбранном товаре 
    }
}
