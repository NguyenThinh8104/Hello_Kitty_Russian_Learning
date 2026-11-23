// Original supplemental exercises. Chapter order/pages verified visually against
// user-provided I Love Russian A1, second edition, 2017, printed page 3.
import { additions } from './curriculum.js';
import { exerciseBank } from './exercise-bank.js';
export const course = {
  title: 'Я люблю русский язык', edition: '2017 · A1 · 2-е издание',
  notice: '14 lessons aligned with the contents and printed page numbers of the 2017 edition. Passages, questions, and model answers are original supplementary material using selected textbook vocabulary. They do not reproduce all textbook exercises. Supplementary audio uses Google Translate.',
};
const baseLessons = [
  {
    id: 'hello', title: 'Привет!', subtitle: 'Hello, I am…', topic: 'Getting acquainted', symbol: 'Я', color: 'coral',
    goal: 'Greet people and introduce your name and home country.',
    grammar: 'Меня зовут + name: My name is… · Я из Вьетнама: I come from Vietnam. After из use the genitive: Вьетнам → Вьетнама, Россия → России.',
    vocab: [['приве́т','hello (informal)'],['здра́вствуйте','hello (polite)'],['и́мя','name'],['студе́нт','male student'],['студе́нтка','female student'],['Вьетна́м','Vietnam'],['Росси́я','Russia'],['спаси́бо','thank you']],
    listening: { title: 'Знакомство', text: 'Привет! Меня зовут Анна. Я из России. Я студентка. Сейчас я живу в Москве. Я изучаю русский язык.', questions: [
      { prompt: 'Как её зовут? (Write names only.)', answers: ['Анна'], hint: 'What is the character\'s name?', explanation: 'Меня зовут Анна. — My name is Anna.' },
      { prompt: 'Откуда Анна? Она из ___.', answers: ['России'], hint: 'из + the country name in the genitive.', explanation: 'из России — from Russia; Россия → России.' },
      { prompt: 'Где она сейчас живёт? В ___.', answers: ['Москве'], hint: 'в + the city name in the prepositional.', explanation: 'в Москве — in Moscow; Москва → Москве.' }
    ]},
    reading: { title: 'Новый друг', text: 'Это Нам. Он из Вьетнама. Сейчас Нам живёт в Ханое. Он студент. Он изучает русский язык. Его подруга Анна живёт в Москве. Она тоже студентка.', questions: [
      { prompt: 'Нам из ___.', answers: ['Вьетнама'], hint: 'Read the second sentence.', explanation: 'Он из Вьетнама. — He is from Vietnam.' },
      { prompt: 'Сейчас Нам живёт в ___.', answers: ['Ханое'], hint: 'Ханой → …', explanation: 'в Ханое — in Hanoi (prepositional).' },
      { prompt: 'Анна тоже ___.', answers: ['студентка'], hint: 'female student.', explanation: 'Она тоже студентка. — She is also a student.' }
    ]},
    speaking: [
      { text: 'Здравствуйте! Меня зовут Анна.', translation: 'Hello! My name is Anna.', tip: 'Stress: зоВУТ. Link the words «меня зовут».' },
      { text: 'Я из Вьетнама.', translation: 'I come from Vietnam.', tip: 'Stress: ВьетНАма.' },
      { text: 'Я изучаю русский язык.', translation: 'I study Russian.', tip: 'Stress: изучАю, рУсский, язЫк.' }
    ],
    writing: { title: 'Расскажите о себе', prompt: 'Как вас зовут? Откуда вы? Где вы живёте? Вы студент или студентка? Какой язык вы изучаете?', guide: 'Write 4–6 sentences introducing yourself. You can use a real name or a fake name.', min: 25, max: 50, starters: ['Меня зовут…','Я из…','Я живу в…','Я изучаю…'], sample: 'Меня зовут Линь. Я из Вьетнама. Сейчас я живу в большом городе Ханое. Я студентка. Я изучаю русский язык. Моя подруга тоже изучает русский язык.' }
  },
  {
    id: 'family', title: 'Моя семья', subtitle: 'Loved ones', topic: 'family', symbol: 'Мы', color: 'purple',
    goal: 'Introducing family, occupation and hobbies.',
    grammar: 'мой брат, моя сестра, моё фото, мои родители: possessives agree in gender and number. У меня есть…: I have…',
    vocab: [['семья́','family'],['ма́ма','mother'],['па́па','father'],['брат','brother'],['сестра́','sister'],['роди́тели','parents'],['врач','doctor'],['учи́тель','male teacher']],
    listening: { title: 'Семья Ивана', text: 'Меня зовут Иван. У меня есть мама, папа и сестра. Моя мама врач. Мой папа учитель. Мою сестру зовут Ольга. Она любит музыку.', questions: [
      { prompt: 'Мама Ивана — ___.', answers: ['врач'], hint: 'Mother\'s occupation.', explanation: 'Моя мама врач. — My mother is a doctor.' },
      { prompt: 'Папа Ивана — ___.', answers: ['учитель'], hint: 'Father\'s occupation.', explanation: 'Мой папа учитель. — My father is a teacher.' },
      { prompt: 'Как зовут сестру? (Write names only.)', answers: ['Ольга'], hint: 'Name of a female.', explanation: 'Мою сестру зовут Ольга. — My sister\'s name is Olga.' }
    ]},
    reading: { title: 'Фотография', text: 'Это моя семья. Мою маму зовут Елена. Она работает в школе. Мой папа работает в больнице. У меня есть брат. Его зовут Максим. Мы часто гуляем вместе.', questions: [
      { prompt: 'Маму зовут ___.', answers: ['Елена'], hint: 'Mother\'s name.', explanation: 'Мою маму зовут Елена.' },
      { prompt: 'Мама работает в ___.', answers: ['школе'], hint: 'школа in prepositional case.', explanation: 'в школе — at school.' },
      { prompt: 'Брата зовут ___.', answers: ['Максим'], hint: 'Brother\'s name.', explanation: 'Его зовут Максим.' }
    ]},
    speaking: [
      { text: 'Это моя семья.', translation: 'This is my family.', tip: 'Stress: моЯ семьЯ.' },
      { text: 'У меня есть брат и сестра.', translation: 'I have a brother and a sister.', tip: 'Distinguish есть with ест. Keep the consonant ть soft.' },
      { text: 'Моя мама работает в школе.', translation: 'My mother works at a school.', tip: 'Stress: рабОтает, шкОле.' }
    ],
    writing: { title: 'Моя семья', prompt: 'Кто есть в вашей семье? Как их зовут? Где они работают или учатся? Что вы любите делать вместе?', guide: 'Write 4–6 sentences about real or imaginary family.', min: 25, max: 55, starters: ['Это моя семья.','У меня есть…','Мою маму зовут…','Мы любим…'], sample: 'У меня есть мама, папа и брат. Мою маму зовут Елена. Она врач. Мой папа работает в школе. Мой брат студент. Мы любим гулять вместе.' }
  },
  {
    id: 'study', title: 'Я учусь', subtitle: 'A day at school', topic: 'Learning', symbol: 'Аа', color: 'blue',
    goal: 'Talk about studying, subjects and school supplies.',
    grammar: 'Я читаю, ты читаешь, он/она читает, мы читаем, вы читаете, они читают. Memorize both verb form and stress.',
    vocab: [['университе́т','university'],['уро́к','class period'],['кни́га','book'],['тетра́дь','notebook'],['ру́чка','pen'],['чита́ть','read'],['писа́ть','write'],['учи́ться','study (at school)']],
    listening: { title: 'На уроке', text: 'Я учусь в университете. Сегодня у нас урок русского языка. На столе лежат книга и тетрадь. Мы читаем текст, а потом пишем слова. Наш преподаватель говорит медленно.', questions: [
      { prompt: 'Я учусь в ___.', answers: ['университете'], hint: 'университет in prepositional case.', explanation: 'в университете — at university.' },
      { prompt: 'Мы читаем ___.', answers: ['текст'], hint: 'The object being read.', explanation: 'Мы читаем текст. — We read the text.' },
      { prompt: 'Преподаватель говорит ___.', answers: ['медленно'], hint: 'Fast or slow?', explanation: 'медленно — slow.' }
    ]},
    reading: { title: 'В библиотеке', text: 'Мария учится в университете. Каждый день она читает книги в библиотеке. Сегодня Мария читает текст о России. Новые слова она пишет в тетради. Вечером она делает домашнее задание.', questions: [
      { prompt: 'Мария читает книги в ___.', answers: ['библиотеке'], hint: 'Library: библиотека.', explanation: 'в библиотеке — at the library.' },
      { prompt: 'Сегодня она читает текст о ___.', answers: ['России'], hint: 'о + prepositional case.', explanation: 'о России — about Russia.' },
      { prompt: 'Вечером она делает домашнее ___.', answers: ['задание'], hint: 'homework.', explanation: 'делать домашнее задание — do homework.' }
    ]},
    speaking: [
      { text: 'Я учусь в университете.', translation: 'I study at university.', tip: 'Stress: учУсь, университЕте.' },
      { text: 'Я читаю текст и пишу слова.', translation: 'I read the text and write down words.', tip: 'Stress: читАю, пишУ, словА.' },
      { text: 'Повторите, пожалуйста.', translation: 'Please repeat.', tip: 'Stress: повторИте, пожАлуйста.' }
    ],
    writing: { title: 'Моя учёба', prompt: 'Где вы учитесь? Какой язык вы изучаете? Что вы делаете на уроке? Когда вы делаете домашнее задание?', guide: 'Write 4–6 sentences about studying.', min: 25, max: 55, starters: ['Я учусь…','На уроке мы…','Я читаю…','Вечером я…'], sample: 'Я учусь в университете. Я изучаю русский язык. На уроке мы читаем тексты и пишем слова. Наш преподаватель говорит медленно. Вечером я делаю домашнее задание.' }
  },
  {
    id: 'city', title: 'Мой город', subtitle: 'My city', topic: 'city', symbol: 'Дом', color: 'green',
    goal: 'Describe the city and ask for the location.',
    grammar: 'Где? — в парке, в магазине, в городе (prepositional case). Куда? — в парк, в магазин, в город (accusative). Distinguish location from direction.',
    vocab: [['го́род','city'],['до́м','home'],['у́лица','street'],['парк','park'],['магази́н','store'],['метро́','subway'],['ря́дом','near, next to'],['центр','center']],
    listening: { title: 'Рядом с домом', text: 'Я живу в большом городе. Мой дом находится в центре. Рядом есть парк и магазин. Утром я гуляю в парке. Потом я иду в магазин и покупаю хлеб.', questions: [
      { prompt: 'Мой дом находится в ___.', answers: ['центре'], hint: 'Center: центр.', explanation: 'в центре — in the center.' },
      { prompt: 'Утром я гуляю в ___.', answers: ['парке'], hint: 'in the park.', explanation: 'Где? В парке (prepositional case).' },
      { prompt: 'В магазине я покупаю ___.', answers: ['хлеб'], hint: 'A type of food.', explanation: 'покупать хлеб — buy bread.' }
    ]},
    reading: { title: 'Прогулка', text: 'Анна живёт в Москве. Её дом находится рядом с метро. В субботу Анна и её друг идут в парк. Там они гуляют и разговаривают. Потом друзья пьют чай в кафе.', questions: [
      { prompt: 'Анна живёт в ___.', answers: ['Москве'], hint: 'City name.', explanation: 'в Москве — in Moscow.' },
      { prompt: 'В субботу друзья идут в ___.', answers: ['парк'], hint: 'Куда? accusative case.', explanation: 'идут в парк — go to the park.' },
      { prompt: 'В кафе друзья пьют ___.', answers: ['чай'], hint: 'A drink.', explanation: 'пьют чай — drink tea.' }
    ]},
    speaking: [
      { text: 'Извините, где находится метро?', translation: 'Excuse me, where is the subway?', tip: 'Stress: извинИте, нахОдится, метрО.' },
      { text: 'Мой дом находится в центре.', translation: 'My house is in the center.', tip: 'Stress: цЕнтре.' },
      { text: 'Я люблю гулять в парке.', translation: 'I like walking in the park.', tip: 'Stress: люблЮ, гулЯть, пАрке.' }
    ],
    writing: { title: 'Город, в котором я живу', prompt: 'В каком городе вы живёте? Где находится ваш дом? Что есть рядом? Где вы любите гулять?', guide: 'Write 4–6 sentences about where you live.', min: 25, max: 55, starters: ['Я живу в…','Мой дом…','Рядом есть…','Я люблю…'], sample: 'Я живу в Ханое. Это большой город. Мой дом находится рядом с парком. Рядом есть магазин и кафе. Утром я люблю гулять в парке. Вечером я отдыхаю дома.' }
  },
  {
    id: 'day', title: 'Мой день', subtitle: 'Daily rhythm of life', topic: 'Activities', symbol: 'День', color: 'orange',
    goal: 'Describe daily activities and times of day.',
    grammar: 'утром (morning), днём (daytime/noon), вечером (evening), ночью (night). В семь часов: at 7 o\'clock; в восемь часов: at 8 o\'clock.',
    vocab: [['у́тро','morning'],['день','days'],['ве́чер','evening'],['встава́ть','wake up'],['за́втракать','have breakfast'],['рабо́тать','work'],['отдыха́ть','rest'],['спать','sleep']],
    listening: { title: 'Каждый день', text: 'Каждый день я встаю в семь часов. Утром я завтракаю дома. В восемь часов я иду в университет. Днём я учусь. Вечером я читаю книгу и слушаю музыку.', questions: [
      { prompt: 'Я встаю в ___ часов. (Write the number in words.)', answers: ['семь'], hint: '7.', explanation: 'в семь часов — at seven o\'clock.' },
      { prompt: 'Утром я завтракаю ___.', answers: ['дома'], hint: 'At home (one word).', explanation: 'дома — at home; дом — house.' },
      { prompt: 'Вечером я слушаю ___.', answers: ['музыку'], hint: 'музыка in accusative case.', explanation: 'слушать музыку — listen to music.' }
    ]},
    reading: { title: 'День Ольги', text: 'Ольга работает в школе. Она встаёт в шесть часов. Утром Ольга пьёт чай и ест хлеб. Днём она работает. После работы она гуляет. Вечером Ольга смотрит фильм дома.', questions: [
      { prompt: 'Ольга работает в ___.', answers: ['школе'], hint: 'Workplace.', explanation: 'в школе — at school.' },
      { prompt: 'Она встаёт в ___ часов. (Write the number in words.)', answers: ['шесть'], hint: '6.', explanation: 'в шесть часов — at six o\'clock.' },
      { prompt: 'Вечером Ольга смотрит ___.', answers: ['фильм'], hint: 'A movie.', explanation: 'смотреть фильм — watch a film.' }
    ]},
    speaking: [
      { text: 'Утром я встаю в семь часов.', translation: 'In the morning I get up at seven o\'clock.', tip: 'Stress: Утром, встаЮ, часОв.' },
      { text: 'Днём я учусь, а вечером отдыхаю.', translation: 'During the day I study, and in the evening I rest.', tip: 'Stress: вЕчером, отдыхАю.' },
      { text: 'Я люблю слушать музыку.', translation: 'I like listening to music.', tip: 'Stress: слУшать, мУзыку.' }
    ],
    writing: { title: 'Обычный день', prompt: 'Когда вы встаёте? Где вы завтракаете? Что вы делаете днём? Как вы отдыхаете вечером?', guide: 'Write 4–6 sentences about your typical day.', min: 25, max: 55, starters: ['Каждый день…','Утром я…','Днём я…','Вечером я…'], sample: 'Каждый день я встаю в семь часов. Утром я завтракаю дома. Потом я иду в университет. Днём я учусь. Вечером я слушаю музыку и читаю книгу.' }
  },
  {
    id: 'food', title: 'В кафе', subtitle: 'A cup of tea, please', topic: 'Eating and drinking', symbol: 'Чай', color: 'purple',
    goal: 'Order politely and talk about your food preferences.',
    grammar: 'Я хочу чай / кофе / суп. Дайте, пожалуйста,…: Please give me… Я люблю + accusative case: Я люблю рыбу. кофе is a masculine noun, not inflected.',
    vocab: [['чай','tea'],['ко́фе','coffee'],['вода́','water'],['суп','soup'],['ры́ба','fish'],['сала́т','salad'],['счёт','bill; check'],['вку́сный','delicious']],
    listening: { title: 'Обед', text: 'Сейчас я в кафе. Я хочу суп и салат. Мой друг хочет рыбу. Мы пьём чай. Здесь очень вкусный чай. После обеда мы идём домой.', questions: [
      { prompt: 'Я хочу суп и ___.', answers: ['салат'], hint: 'Something eaten with soup.', explanation: 'Я хочу суп и салат.' },
      { prompt: 'Мой друг хочет ___.', answers: ['рыбу'], hint: 'рыба in accusative case.', explanation: 'хочет рыбу — wants to eat fish.' },
      { prompt: 'Мы пьём ___.', answers: ['чай'], hint: 'A drink.', explanation: 'Мы пьём чай. — We drink tea.' }
    ]},
    reading: { title: 'Завтрак', text: 'Утром Антон завтракает дома. Он ест хлеб и сыр. Обычно он пьёт кофе, но сегодня он пьёт чай. Его сестра любит кашу. Она пьёт воду. Потом они идут в университет.', questions: [
      { prompt: 'Антон завтракает ___.', answers: ['дома'], hint: 'Where?', explanation: 'дома — At home.' },
      { prompt: 'Обычно он пьёт ___.', answers: ['кофе'], hint: 'Note «обычно» (usually).', explanation: 'Usually I drink coffee, today I drink tea.' },
      { prompt: 'Его сестра любит ___.', answers: ['кашу'], hint: 'каша in accusative case.', explanation: 'любит кашу — likes porridge.' }
    ]},
    speaking: [
      { text: 'Дайте, пожалуйста, чай и салат.', translation: 'Please give me tea and salad.', tip: 'Stress: дАйте, салАт.' },
      { text: 'Я хочу кофе без сахара.', translation: 'I want coffee without sugar.', tip: 'Stress: хочУ, кОфе, сАхара.' },
      { text: 'Можно счёт, пожалуйста?', translation: 'Could I have the bill, please?', tip: 'Счёт has ё; pronounce the part сч almost щ long.' }
    ],
    writing: { title: 'Что я люблю есть', prompt: 'Что вы обычно едите утром? Что вы пьёте? Что вы любите есть на обед? Вы часто ходите в кафе?', guide: 'Write 4–6 sentences about eating habits.', min: 25, max: 55, starters: ['Утром я…','Я обычно пью…','Я люблю…','В кафе я…'], sample: 'Утром я ем хлеб и сыр. Я обычно пью чай. На обед я люблю есть суп и рыбу. Иногда я хожу в кафе. В кафе я заказываю салат и кофе.' }
  },
  {
    id: 'weekend', title: 'В выходные', subtitle: 'Where to go on the weekend?', topic: 'free time', symbol: 'Парк', color: 'blue',
    goal: 'Talk about hobbies and weekend plans.',
    grammar: 'Я люблю читать / гулять / слушать музыку: люблю + infinitive. В субботу, в воскресенье: on Saturday, Sunday.',
    vocab: [['суббо́та','Saturday'],['воскресе́нье','Sunday'],['выходны́е','weekend day off'],['гуля́ть','go for a walk'],['смотре́ть','watch'],['встреча́ться','meet'],['дру́г','male friend'],['свобо́дное вре́мя','free time']],
    listening: { title: 'Планы на субботу', text: 'В субботу я не работаю. Утром я читаю книгу дома. Днём я встречаюсь с другом. Мы идём в парк и играем в футбол. Вечером мы смотрим фильм.', questions: [
      { prompt: 'Утром я читаю ___.', answers: ['книгу'], hint: 'книга in accusative case.', explanation: 'читаю книгу — reading books.' },
      { prompt: 'В парке мы играем в ___.', answers: ['футбол'], hint: 'Sports.', explanation: 'играть в футбол — play soccer.' },
      { prompt: 'Вечером мы смотрим ___.', answers: ['фильм'], hint: 'End of paragraph activity.', explanation: 'смотрим фильм — watch a film.' }
    ]},
    reading: { title: 'Свободное время', text: 'Лена любит музыку. В свободное время она играет на гитаре. В воскресенье Лена встречается с подругой в кафе. Они пьют кофе и разговаривают. Вечером Лена звонит маме.', questions: [
      { prompt: 'Лена играет на ___.', answers: ['гитаре'], hint: 'гитара in prepositional case.', explanation: 'играть на гитаре — plays the guitar.' },
      { prompt: 'Лена встречается с подругой в ___.', answers: ['кафе'], hint: 'Uninflected location.', explanation: 'в кафе — at the coffee shop.' },
      { prompt: 'Вечером Лена звонит ___.', answers: ['маме'], hint: 'Звонить кому? dative case.', explanation: 'звонит маме — called his mother.' }
    ]},
    speaking: [
      { text: 'Что вы делаете в свободное время?', translation: 'What do you do in your free time?', tip: 'Stress: дЕлаете, свобОдное, врЕмя.' },
      { text: 'В субботу я встречаюсь с другом.', translation: 'I see you on Saturday.', tip: 'Stress: суббОту, встречАюсь, дрУгом.' },
      { text: 'Я люблю играть на гитаре.', translation: 'I like playing the guitar.', tip: 'Stress: игрАть, гитАре.' }
    ],
    writing: { title: 'Мои выходные', prompt: 'Что вы делаете в субботу? С кем вы встречаетесь? Где вы гуляете? Что вы любите делать вечером?', guide: 'Write 4–6 sentences about your weekend.', min: 25, max: 55, starters: ['В субботу я…','Утром я…','Я встречаюсь…','Вечером мы…'], sample: 'В субботу я не учусь. Утром я читаю книгу. Днём я встречаюсь с другом. Мы гуляем в парке и разговариваем. Вечером мы смотрим фильм. Я очень люблю выходные.' }
  }
];
const chapterMap = [
 ['hello','Привет!','6–15'], ['identity','Кто вы?','16–25'], ['family','Моя семья','26–41'],
 ['work','Живу, учусь, работаю','42–53'], ['countries','Города, страны','54–65'],
 ['past','Что вы делали вчера?','66–75'], ['food','Ресторан','76–89'], ['day','Мой день','90–103'],
 ['weekend','Кино. Музыка. Театр','104–119'], ['house','Дом, квартира','120–133'],
 ['study','В университете','134–145'], ['birthday','День рождения','146–159'],
 ['city','В городе','160–175'], ['stories','Читаем русскую литературу','176–185']
];
export const lessons = chapterMap.map(([id,title,pages],index) => {
  const item = [...baseLessons,...additions].find(l => l.id === id);
  return {...item,title,pages,number:index+1,bookAudio:`https://resources.lidenz.ru/audio/a1v2/l${index+1}/m1/`};
});
// Vocabulary targets selected from the printed chapter glossaries. Exercises may
// also reuse words from earlier chapters and common A1 connecting words.
lessons.find(l=>l.id==='hello').vocab = [['приве́т','hello (informal)'],['здра́вствуйте','hello (polite)'],['студе́нт','male student'],['кни́га','book'],['стол','table'],['слова́рь','dictionary'],['спаси́бо','thank you'],['пожа́луйста','please; you are welcome; here you are']];
lessons.find(l=>l.id==='family').vocab = [['семья́','family (lesson topic)'],['ба́бушка','grandmother'],['де́душка','grandfather'],['роди́тели','parents'],['брат','brother'],['сестра́','sister'],['изуча́ть','study, research'],['де́ти','children']];
lessons.find(l=>l.id==='day').vocab = [['встава́ть','wake up'],['идти́','go on foot (one direction)'],['ходи́ть','go on foot (habitual or in different directions)'],['е́хать','go by vehicle (one direction)'],['е́здить','go by vehicle (habitual or in different directions)'],['по́езд','train'],['ра́но','early'],['по́здно','late']];
lessons.find(l=>l.id==='study').vocab = [['факульте́т','faculty; department'],['предме́т','subject; object'],['исто́рия','history; story'],['литерату́ра','literature'],['матема́тика','mathematics'],['уме́ть','know how to; have the skill to'],['помога́ть','help'],['сдава́ть экза́мен','take an exam']];
Object.assign(lessons.find(l=>l.id==='weekend'), {
 subtitle:'Cinema, music and theater', topic:'Culture', goal:'Talk about film genres, music and cultural preferences.',
 vocab:[['коме́дия','comedy (film or play)'],['дете́ктив','detective stories/movies'],['фильм','film'],['спекта́кль','play'],['о́пера','opera'],['джаз','jazz'],['интере́сный','interesting'],['смешно́й','funny']],
 listening:{title:'Вечер в кино',text:'В субботу мы с другом идём в кино. Мы хотим посмотреть комедию. Мой друг любит смешные фильмы. Я тоже люблю комедии, но иногда смотрю детективы. После фильма мы идём в кафе.',questions:[
  {prompt:'В субботу друзья идут в ___.',answers:['кино'],hint:'Place to watch movies.',explanation:'идти в кино — go to the movies.'},
  {prompt:'Они хотят посмотреть ___.',answers:['комедию'],hint:'комедия in accusative case.',explanation:'посмотреть комедию — watch a comedy movie.'},
  {prompt:'После фильма друзья идут в ___.',answers:['кафе'],hint:'Place to drink coffee.',explanation:'После фильма мы идём в кафе.'}
 ]},
 reading:{title:'Музыка и театр',text:'Маша любит классическую музыку. В пятницу она идёт в театр с сестрой. Они смотрят балет. Её брат Антон любит джаз. Вечером он слушает музыку дома. В воскресенье вся семья смотрит комедию.',questions:[
  {prompt:'Маша любит ___ музыку.',answers:['классическую'],hint:'классическая in accusative case.',explanation:'классическую музыку — classical music (accusative).'},
  {prompt:'В театре сёстры смотрят ___.',answers:['балет'],hint:'Ballet.',explanation:'Они смотрят балет.'},
  {prompt:'Антон любит ___.',answers:['джаз'],hint:'The brother\'s favorite type of music.',explanation:'Её брат Антон любит джаз.'}
 ]},
 speaking:[{text:'Я люблю смотреть комедии.',translation:'I like watching comedy movies.',tip:'Stress: смотрЕть, комЕдии.'},{text:'В пятницу мы идём в театр.',translation:'On Friday we are going to the theater.',tip:'Stress: пЯтницу, идЁм, теАтр.'},{text:'Мне нравится классическая музыка.',translation:'I like classical music.',tip:'Stress: нрАвится, классИческая, мУзыка.'}],
 writing:{title:'Кино и музыка',prompt:'Какие фильмы вы любите? Какую музыку вы слушаете? Вы любите театр? С кем вы ходите в кино?',guide:'Write 4–6 sentences about your movie and music preferences.',min:25,max:55,starters:['Я люблю…','Мне нравится…','Обычно я слушаю…','В кино я хожу…'],sample:'Я люблю смотреть комедии. Мне нравятся смешные фильмы. Я часто хожу в кино с другом. Дома я слушаю джаз. Моя сестра любит классическую музыку. Иногда мы вместе ходим в театр.'}
});
const chapterGrammar={
 hello:'Кто это? — Это студент. Что это? — Это словарь. Меня зовут + name: My name is… The practice also reviews home countries: из России, из Вьетнама (genitive case).',
 day:'идти / ехать: one direction or one particular trip (я иду, я еду). ходить / ездить: habitual movement or movement in different directions (я хожу, я езжу). в семь часов — at 7 o\'clock; утром — morning; вечером — evening.',
 weekend:'Мне нравится фильм / музыка (singular), мне нравятся фильмы (plural). Я люблю смотреть комедии: люблю + infinitive. Фильм начинается в семь часов: Movie starts at 7 o\'clock.',
 house:'На столе лежит книга. У окна стоит стол. На стене висит картина. Absence: нет + genitive case (нет телевизора, нет микроволновки). Distinguish standing, lying, and hanging; use the correct location prepositions.',
 study:'мочь / уметь / должен + infinitive: могу помочь, умею писать, должен учиться (female: должна). читал: the process of reading; прочитал: finished reading. Consider both context and verbal aspect.',
 city:'Где? в парке (location, prepositional). Куда? в парк (destination, accusative). Идите прямо, поверните налево / направо: Go straight, turn left/right. на автобусе / на такси: travel by bus/taxi.'
};
for (const lesson of lessons) {
  if(chapterGrammar[lesson.id])lesson.grammar=chapterGrammar[lesson.id];
  const extra = exerciseBank[lesson.id];
  const ids = ['core','practice','challenge'];
  for (const skill of ['listening','reading','writing']) {
    lesson[`${skill}Sets`] = [lesson[skill],...extra[skill]].map((task,index) => ({...task,id:ids[index],label:['Warm-up','Practice','Challenge'][index]}));
  }
  lesson.speaking = [...lesson.speaking,...extra.speaking];
}
export const alphabet = [
 ['А а','а'],['Б б','бэ'],['В в','вэ'],['Г г','гэ'],['Д д','дэ'],['Е е','е'],['Ё ё','ё'],['Ж ж','жэ'],['З з','зэ'],['И и','и'],['Й й','и краткое'],['К к','ка'],['Л л','эль'],['М м','эм'],['Н н','эн'],['О о','о'],['П п','пэ'],['Р р','эр'],['С с','эс'],['Т т','тэ'],['У у','у'],['Ф ф','эф'],['Х х','ха'],['Ц ц','цэ'],['Ч ч','че'],['Ш ш','ша'],['Щ щ','ща'],['Ъ ъ','твёрдый знак'],['Ы ы','ы'],['Ь ь','мягкий знак'],['Э э','э'],['Ю ю','ю'],['Я я','я']
];
