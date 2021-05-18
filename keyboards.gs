   let startKeyboard = {keyboard : 
  [[
    {text:"Показать меню"}
  ],
  [
    {text:"Описание пиццерии"}
  ]],
  resize_keyboard: true,
  one_time_keyboard: true
  };

  let backKeyboard = {keyboard:
  [[
    {text: "Вернуться назад", callback_data : "назад"}
  ]],
    resize_keyboard: true,
    one_time_keyboard: true
  };


  let urlKeyboard = {inline_keyboard:
  [[
      {text : "Перейти на сайт пиццерии", url : "http://www.galaccia.ru"}
  ]]};

  let removeKeyboard = { 
   remove_keyboard : true
  };

  let nextKyboard = {keyboard : 
  [[
    {text:"Продолжить"}  
  ]],
  resize_keyboard: true,
  one_time_keyboard: true
  };


  let yesnoKeyboard = {keyboard : 
  [[
    {text: "Да, подтвердить заказ"}, {text : "Нет, очистить корзину"}
  ]],
  resize_keyboard: true,
  one_time_keyboard: true
  };
 

  let phoneKeyboard = { keyboard : 
  [[
    { text:"Отправить контакт", request_contact:true } 
  ]],
  resize_keyboard: true,
  };

 
