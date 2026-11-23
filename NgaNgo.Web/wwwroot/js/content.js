// Original supplemental exercises. Chapter order/pages verified visually against
// user-provided I Love Russian A1, second edition, 2017, printed page 3.
import { additions } from './curriculum.js';
import { exerciseBank } from './exercise-bank.js';
export const course = {
  title: 'Я люблю русский язык', edition: '2017 · A1 · 2-е издание',
  notice: 'Lộ trình 14 bài và số trang đối chiếu PDF bản 2017. Đoạn văn, câu hỏi và bài mẫu là bài bổ trợ tự biên soạn, có dùng từ vựng trọng tâm của sách; không thay thế toàn bộ bài tập gốc. Audio bài bổ trợ dùng giọng Google Translate.',
};
const baseLessons = [
  {
    id: 'hello', title: 'Привет!', subtitle: 'Chào bạn, mình là…', topic: 'Làm quen', symbol: 'Я', color: 'coral',
    goal: 'Chào hỏi, giới thiệu tên và quê quán.',
    grammar: 'Меня зовут + tên: Tôi tên là… · Я из Вьетнама: Tôi đến từ Việt Nam. Sau из dùng cách 2: Вьетнам → Вьетнама, Россия → России.',
    vocab: [['приве́т','xin chào (thân mật)'],['здра́вствуйте','xin chào (lịch sự)'],['и́мя','tên'],['студе́нт','sinh viên nam'],['студе́нтка','sinh viên nữ'],['Вьетна́м','Việt Nam'],['Росси́я','Nga'],['спаси́бо','cảm ơn']],
    listening: { title: 'Знакомство', text: 'Привет! Меня зовут Анна. Я из России. Я студентка. Сейчас я живу в Москве. Я изучаю русский язык.', questions: [
      { prompt: 'Как её зовут? (Chỉ viết tên.)', answers: ['Анна'], hint: 'Tên nhân vật là gì?', explanation: 'Меня зовут Анна. — Tôi tên là Anna.' },
      { prompt: 'Откуда Анна? Она из ___.', answers: ['России'], hint: 'из + tên nước ở cách 2.', explanation: 'из России — đến từ Nga; Россия → России.' },
      { prompt: 'Где она сейчас живёт? В ___.', answers: ['Москве'], hint: 'в + tên thành phố ở cách 6.', explanation: 'в Москве — ở Moskva; Москва → Москве.' }
    ]},
    reading: { title: 'Новый друг', text: 'Это Нам. Он из Вьетнама. Сейчас Нам живёт в Ханое. Он студент. Он изучает русский язык. Его подруга Анна живёт в Москве. Она тоже студентка.', questions: [
      { prompt: 'Нам из ___.', answers: ['Вьетнама'], hint: 'Đọc câu thứ hai.', explanation: 'Он из Вьетнама. — Anh ấy đến từ Việt Nam.' },
      { prompt: 'Сейчас Нам живёт в ___.', answers: ['Ханое'], hint: 'Ханой → …', explanation: 'в Ханое — ở Hà Nội (cách 6).' },
      { prompt: 'Анна тоже ___.', answers: ['студентка'], hint: 'Sinh viên nữ.', explanation: 'Она тоже студентка. — Cô ấy cũng là sinh viên.' }
    ]},
    speaking: [
      { text: 'Здравствуйте! Меня зовут Анна.', translation: 'Xin chào! Tôi tên là Anna.', tip: 'Nhấn trọng âm: зоВУТ. Đọc liền «меня зовут».' },
      { text: 'Я из Вьетнама.', translation: 'Tôi đến từ Việt Nam.', tip: 'Nhấn trọng âm: ВьетНАма.' },
      { text: 'Я изучаю русский язык.', translation: 'Tôi học tiếng Nga.', tip: 'Nhấn trọng âm: изучАю, рУсский, язЫк.' }
    ],
    writing: { title: 'Расскажите о себе', prompt: 'Как вас зовут? Откуда вы? Где вы живёте? Вы студент или студентка? Какой язык вы изучаете?', guide: 'Viết 4–6 câu giới thiệu bản thân. Có thể dùng tên thật hoặc tên giả.', min: 25, max: 50, starters: ['Меня зовут…','Я из…','Я живу в…','Я изучаю…'], sample: 'Меня зовут Линь. Я из Вьетнама. Сейчас я живу в большом городе Ханое. Я студентка. Я изучаю русский язык. Моя подруга тоже изучает русский язык.' }
  },
  {
    id: 'family', title: 'Моя семья', subtitle: 'Những người thân yêu', topic: 'Gia đình', symbol: 'Мы', color: 'purple',
    goal: 'Giới thiệu gia đình, nghề nghiệp và sở thích.',
    grammar: 'мой брат, моя сестра, моё фото, мои родители: từ sở hữu hòa hợp giống và số. У меня есть…: Tôi có…',
    vocab: [['семья́','gia đình'],['ма́ма','mẹ'],['па́па','bố'],['брат','anh/em trai'],['сестра́','chị/em gái'],['роди́тели','bố mẹ'],['врач','bác sĩ'],['учи́тель','giáo viên nam']],
    listening: { title: 'Семья Ивана', text: 'Меня зовут Иван. У меня есть мама, папа и сестра. Моя мама врач. Мой папа учитель. Мою сестру зовут Ольга. Она любит музыку.', questions: [
      { prompt: 'Мама Ивана — ___.', answers: ['врач'], hint: 'Nghề nghiệp của mẹ.', explanation: 'Моя мама врач. — Mẹ tôi là bác sĩ.' },
      { prompt: 'Папа Ивана — ___.', answers: ['учитель'], hint: 'Nghề nghiệp của bố.', explanation: 'Мой папа учитель. — Bố tôi là giáo viên.' },
      { prompt: 'Как зовут сестру? (Chỉ viết tên.)', answers: ['Ольга'], hint: 'Tên một người nữ.', explanation: 'Мою сестру зовут Ольга. — Em/chị gái tôi tên là Olga.' }
    ]},
    reading: { title: 'Фотография', text: 'Это моя семья. Мою маму зовут Елена. Она работает в школе. Мой папа работает в больнице. У меня есть брат. Его зовут Максим. Мы часто гуляем вместе.', questions: [
      { prompt: 'Маму зовут ___.', answers: ['Елена'], hint: 'Tên mẹ.', explanation: 'Мою маму зовут Елена.' },
      { prompt: 'Мама работает в ___.', answers: ['школе'], hint: 'школа ở cách 6.', explanation: 'в школе — ở trường học.' },
      { prompt: 'Брата зовут ___.', answers: ['Максим'], hint: 'Tên anh/em trai.', explanation: 'Его зовут Максим.' }
    ]},
    speaking: [
      { text: 'Это моя семья.', translation: 'Đây là gia đình tôi.', tip: 'Nhấn trọng âm: моЯ семьЯ.' },
      { text: 'У меня есть брат и сестра.', translation: 'Tôi có anh/em trai và chị/em gái.', tip: 'Phân biệt есть với ест. Giữ phụ âm ть mềm.' },
      { text: 'Моя мама работает в школе.', translation: 'Mẹ tôi làm việc ở trường học.', tip: 'Nhấn trọng âm: рабОтает, шкОле.' }
    ],
    writing: { title: 'Моя семья', prompt: 'Кто есть в вашей семье? Как их зовут? Где они работают или учатся? Что вы любите делать вместе?', guide: 'Viết 4–6 câu về gia đình thật hoặc tưởng tượng.', min: 25, max: 55, starters: ['Это моя семья.','У меня есть…','Мою маму зовут…','Мы любим…'], sample: 'У меня есть мама, папа и брат. Мою маму зовут Елена. Она врач. Мой папа работает в школе. Мой брат студент. Мы любим гулять вместе.' }
  },
  {
    id: 'study', title: 'Я учусь', subtitle: 'Một ngày ở trường', topic: 'Học tập', symbol: 'Аа', color: 'blue',
    goal: 'Nói về việc học, môn học và đồ dùng học tập.',
    grammar: 'Я читаю, ты читаешь, он/она читает, мы читаем, вы читаете, они читают. Học thuộc cả dạng động từ và trọng âm.',
    vocab: [['университе́т','trường đại học'],['уро́к','tiết học'],['кни́га','sách'],['тетра́дь','vở'],['ру́чка','bút'],['чита́ть','đọc'],['писа́ть','viết'],['учи́ться','học (ở trường)']],
    listening: { title: 'На уроке', text: 'Я учусь в университете. Сегодня у нас урок русского языка. На столе лежат книга и тетрадь. Мы читаем текст, а потом пишем слова. Наш преподаватель говорит медленно.', questions: [
      { prompt: 'Я учусь в ___.', answers: ['университете'], hint: 'университет ở cách 6.', explanation: 'в университете — ở trường đại học.' },
      { prompt: 'Мы читаем ___.', answers: ['текст'], hint: 'Đối tượng được đọc.', explanation: 'Мы читаем текст. — Chúng tôi đọc bài khóa.' },
      { prompt: 'Преподаватель говорит ___.', answers: ['медленно'], hint: 'Nhanh hay chậm?', explanation: 'медленно — chậm.' }
    ]},
    reading: { title: 'В библиотеке', text: 'Мария учится в университете. Каждый день она читает книги в библиотеке. Сегодня Мария читает текст о России. Новые слова она пишет в тетради. Вечером она делает домашнее задание.', questions: [
      { prompt: 'Мария читает книги в ___.', answers: ['библиотеке'], hint: 'Thư viện: библиотека.', explanation: 'в библиотеке — ở thư viện.' },
      { prompt: 'Сегодня она читает текст о ___.', answers: ['России'], hint: 'о + cách 6.', explanation: 'о России — về nước Nga.' },
      { prompt: 'Вечером она делает домашнее ___.', answers: ['задание'], hint: 'Bài tập về nhà.', explanation: 'делать домашнее задание — làm bài tập về nhà.' }
    ]},
    speaking: [
      { text: 'Я учусь в университете.', translation: 'Tôi học ở trường đại học.', tip: 'Nhấn trọng âm: учУсь, университЕте.' },
      { text: 'Я читаю текст и пишу слова.', translation: 'Tôi đọc bài khóa và viết từ.', tip: 'Nhấn trọng âm: читАю, пишУ, словА.' },
      { text: 'Повторите, пожалуйста.', translation: 'Xin hãy nhắc lại.', tip: 'Nhấn trọng âm: повторИте, пожАлуйста.' }
    ],
    writing: { title: 'Моя учёба', prompt: 'Где вы учитесь? Какой язык вы изучаете? Что вы делаете на уроке? Когда вы делаете домашнее задание?', guide: 'Viết 4–6 câu về việc học.', min: 25, max: 55, starters: ['Я учусь…','На уроке мы…','Я читаю…','Вечером я…'], sample: 'Я учусь в университете. Я изучаю русский язык. На уроке мы читаем тексты и пишем слова. Наш преподаватель говорит медленно. Вечером я делаю домашнее задание.' }
  },
  {
    id: 'city', title: 'Мой город', subtitle: 'Thành phố của mình', topic: 'Thành phố', symbol: 'Дом', color: 'green',
    goal: 'Miêu tả thành phố và hỏi vị trí.',
    grammar: 'Где? — в парке, в магазине, в городе (cách 6). Куда? — в парк, в магазин, в город (cách 4). Phân biệt vị trí và hướng đi.',
    vocab: [['го́род','thành phố'],['до́м','nhà'],['у́лица','phố'],['парк','công viên'],['магази́н','cửa hàng'],['метро́','tàu điện ngầm'],['ря́дом','gần, bên cạnh'],['центр','trung tâm']],
    listening: { title: 'Рядом с домом', text: 'Я живу в большом городе. Мой дом находится в центре. Рядом есть парк и магазин. Утром я гуляю в парке. Потом я иду в магазин и покупаю хлеб.', questions: [
      { prompt: 'Мой дом находится в ___.', answers: ['центре'], hint: 'Trung tâm: центр.', explanation: 'в центре — ở trung tâm.' },
      { prompt: 'Утром я гуляю в ___.', answers: ['парке'], hint: 'Ở công viên.', explanation: 'Где? В парке (cách 6).' },
      { prompt: 'В магазине я покупаю ___.', answers: ['хлеб'], hint: 'Một loại thực phẩm.', explanation: 'покупать хлеб — mua bánh mì.' }
    ]},
    reading: { title: 'Прогулка', text: 'Анна живёт в Москве. Её дом находится рядом с метро. В субботу Анна и её друг идут в парк. Там они гуляют и разговаривают. Потом друзья пьют чай в кафе.', questions: [
      { prompt: 'Анна живёт в ___.', answers: ['Москве'], hint: 'Tên thành phố.', explanation: 'в Москве — ở Moskva.' },
      { prompt: 'В субботу друзья идут в ___.', answers: ['парк'], hint: 'Куда? Cách 4.', explanation: 'идут в парк — đi đến công viên.' },
      { prompt: 'В кафе друзья пьют ___.', answers: ['чай'], hint: 'Đồ uống.', explanation: 'пьют чай — uống trà.' }
    ]},
    speaking: [
      { text: 'Извините, где находится метро?', translation: 'Xin lỗi, tàu điện ngầm ở đâu?', tip: 'Nhấn trọng âm: извинИте, нахОдится, метрО.' },
      { text: 'Мой дом находится в центре.', translation: 'Nhà tôi ở trung tâm.', tip: 'Nhấn trọng âm: цЕнтре.' },
      { text: 'Я люблю гулять в парке.', translation: 'Tôi thích đi dạo trong công viên.', tip: 'Nhấn trọng âm: люблЮ, гулЯть, пАрке.' }
    ],
    writing: { title: 'Город, в котором я живу', prompt: 'В каком городе вы живёте? Где находится ваш дом? Что есть рядом? Где вы любите гулять?', guide: 'Viết 4–6 câu về nơi bạn sống.', min: 25, max: 55, starters: ['Я живу в…','Мой дом…','Рядом есть…','Я люблю…'], sample: 'Я живу в Ханое. Это большой город. Мой дом находится рядом с парком. Рядом есть магазин и кафе. Утром я люблю гулять в парке. Вечером я отдыхаю дома.' }
  },
  {
    id: 'day', title: 'Мой день', subtitle: 'Nhịp sống mỗi ngày', topic: 'Sinh hoạt', symbol: 'День', color: 'orange',
    goal: 'Kể về sinh hoạt và thời gian trong ngày.',
    grammar: 'утром (buổi sáng), днём (ban ngày/buổi trưa), вечером (buổi tối), ночью (ban đêm). В семь часов: lúc 7 giờ; в восемь часов: lúc 8 giờ.',
    vocab: [['у́тро','buổi sáng'],['день','ngày'],['ве́чер','buổi tối'],['встава́ть','thức dậy'],['за́втракать','ăn sáng'],['рабо́тать','làm việc'],['отдыха́ть','nghỉ ngơi'],['спать','ngủ']],
    listening: { title: 'Каждый день', text: 'Каждый день я встаю в семь часов. Утром я завтракаю дома. В восемь часов я иду в университет. Днём я учусь. Вечером я читаю книгу и слушаю музыку.', questions: [
      { prompt: 'Я встаю в ___ часов. (Viết bằng chữ.)', answers: ['семь'], hint: '7.', explanation: 'в семь часов — lúc bảy giờ.' },
      { prompt: 'Утром я завтракаю ___.', answers: ['дома'], hint: 'Ở nhà (một từ).', explanation: 'дома — ở nhà; дом — ngôi nhà.' },
      { prompt: 'Вечером я слушаю ___.', answers: ['музыку'], hint: 'музыка ở cách 4.', explanation: 'слушать музыку — nghe nhạc.' }
    ]},
    reading: { title: 'День Ольги', text: 'Ольга работает в школе. Она встаёт в шесть часов. Утром Ольга пьёт чай и ест хлеб. Днём она работает. После работы она гуляет. Вечером Ольга смотрит фильм дома.', questions: [
      { prompt: 'Ольга работает в ___.', answers: ['школе'], hint: 'Nơi làm việc.', explanation: 'в школе — ở trường học.' },
      { prompt: 'Она встаёт в ___ часов. (Viết bằng chữ.)', answers: ['шесть'], hint: '6.', explanation: 'в шесть часов — lúc sáu giờ.' },
      { prompt: 'Вечером Ольга смотрит ___.', answers: ['фильм'], hint: 'Một bộ phim.', explanation: 'смотреть фильм — xem phim.' }
    ]},
    speaking: [
      { text: 'Утром я встаю в семь часов.', translation: 'Buổi sáng tôi dậy lúc bảy giờ.', tip: 'Nhấn trọng âm: Утром, встаЮ, часОв.' },
      { text: 'Днём я учусь, а вечером отдыхаю.', translation: 'Ban ngày tôi học, còn buổi tối tôi nghỉ ngơi.', tip: 'Nhấn trọng âm: вЕчером, отдыхАю.' },
      { text: 'Я люблю слушать музыку.', translation: 'Tôi thích nghe nhạc.', tip: 'Nhấn trọng âm: слУшать, мУзыку.' }
    ],
    writing: { title: 'Обычный день', prompt: 'Когда вы встаёте? Где вы завтракаете? Что вы делаете днём? Как вы отдыхаете вечером?', guide: 'Viết 4–6 câu về một ngày thường của bạn.', min: 25, max: 55, starters: ['Каждый день…','Утром я…','Днём я…','Вечером я…'], sample: 'Каждый день я встаю в семь часов. Утром я завтракаю дома. Потом я иду в университет. Днём я учусь. Вечером я слушаю музыку и читаю книгу.' }
  },
  {
    id: 'food', title: 'В кафе', subtitle: 'Cho mình một tách trà', topic: 'Ăn uống', symbol: 'Чай', color: 'purple',
    goal: 'Gọi món lịch sự và nói về sở thích ăn uống.',
    grammar: 'Я хочу чай / кофе / суп. Дайте, пожалуйста,…: Xin cho tôi… Я люблю + cách 4: Я люблю рыбу. кофе là danh từ giống đực, không biến cách.',
    vocab: [['чай','trà'],['ко́фе','cà phê'],['вода́','nước'],['суп','súp'],['ры́ба','cá'],['сала́т','salad'],['счёт','hóa đơn'],['вку́сный','ngon']],
    listening: { title: 'Обед', text: 'Сейчас я в кафе. Я хочу суп и салат. Мой друг хочет рыбу. Мы пьём чай. Здесь очень вкусный чай. После обеда мы идём домой.', questions: [
      { prompt: 'Я хочу суп и ___.', answers: ['салат'], hint: 'Món ăn kèm súp.', explanation: 'Я хочу суп и салат.' },
      { prompt: 'Мой друг хочет ___.', answers: ['рыбу'], hint: 'рыба ở cách 4.', explanation: 'хочет рыбу — muốn ăn cá.' },
      { prompt: 'Мы пьём ___.', answers: ['чай'], hint: 'Đồ uống.', explanation: 'Мы пьём чай. — Chúng tôi uống trà.' }
    ]},
    reading: { title: 'Завтрак', text: 'Утром Антон завтракает дома. Он ест хлеб и сыр. Обычно он пьёт кофе, но сегодня он пьёт чай. Его сестра любит кашу. Она пьёт воду. Потом они идут в университет.', questions: [
      { prompt: 'Антон завтракает ___.', answers: ['дома'], hint: 'Ở đâu?', explanation: 'дома — ở nhà.' },
      { prompt: 'Обычно он пьёт ___.', answers: ['кофе'], hint: 'Chú ý «обычно» (thường).', explanation: 'Thường uống cà phê, hôm nay uống trà.' },
      { prompt: 'Его сестра любит ___.', answers: ['кашу'], hint: 'каша ở cách 4.', explanation: 'любит кашу — thích cháo.' }
    ]},
    speaking: [
      { text: 'Дайте, пожалуйста, чай и салат.', translation: 'Xin cho tôi trà và salad.', tip: 'Nhấn trọng âm: дАйте, салАт.' },
      { text: 'Я хочу кофе без сахара.', translation: 'Tôi muốn cà phê không đường.', tip: 'Nhấn trọng âm: хочУ, кОфе, сАхара.' },
      { text: 'Можно счёт, пожалуйста?', translation: 'Cho tôi xin hóa đơn được không?', tip: 'Счёт có ё; đọc phần сч gần như щ dài.' }
    ],
    writing: { title: 'Что я люблю есть', prompt: 'Что вы обычно едите утром? Что вы пьёте? Что вы любите есть на обед? Вы часто ходите в кафе?', guide: 'Viết 4–6 câu về thói quen ăn uống.', min: 25, max: 55, starters: ['Утром я…','Я обычно пью…','Я люблю…','В кафе я…'], sample: 'Утром я ем хлеб и сыр. Я обычно пью чай. На обед я люблю есть суп и рыбу. Иногда я хожу в кафе. В кафе я заказываю салат и кофе.' }
  },
  {
    id: 'weekend', title: 'В выходные', subtitle: 'Cuối tuần đi đâu?', topic: 'Thời gian rảnh', symbol: 'Парк', color: 'blue',
    goal: 'Nói về sở thích và kế hoạch cuối tuần.',
    grammar: 'Я люблю читать / гулять / слушать музыку: люблю + động từ nguyên thể. В субботу, в воскресенье: vào thứ Bảy, Chủ nhật.',
    vocab: [['суббо́та','thứ Bảy'],['воскресе́нье','Chủ nhật'],['выходны́е','ngày nghỉ cuối tuần'],['гуля́ть','đi dạo'],['смотре́ть','xem'],['встреча́ться','gặp nhau'],['дру́г','bạn nam'],['свобо́дное вре́мя','thời gian rảnh']],
    listening: { title: 'Планы на субботу', text: 'В субботу я не работаю. Утром я читаю книгу дома. Днём я встречаюсь с другом. Мы идём в парк и играем в футбол. Вечером мы смотрим фильм.', questions: [
      { prompt: 'Утром я читаю ___.', answers: ['книгу'], hint: 'книга ở cách 4.', explanation: 'читаю книгу — đọc sách.' },
      { prompt: 'В парке мы играем в ___.', answers: ['футбол'], hint: 'Môn thể thao.', explanation: 'играть в футбол — chơi bóng đá.' },
      { prompt: 'Вечером мы смотрим ___.', answers: ['фильм'], hint: 'Hoạt động cuối đoạn.', explanation: 'смотрим фильм — xem phim.' }
    ]},
    reading: { title: 'Свободное время', text: 'Лена любит музыку. В свободное время она играет на гитаре. В воскресенье Лена встречается с подругой в кафе. Они пьют кофе и разговаривают. Вечером Лена звонит маме.', questions: [
      { prompt: 'Лена играет на ___.', answers: ['гитаре'], hint: 'гитара ở cách 6.', explanation: 'играть на гитаре — chơi đàn ghi-ta.' },
      { prompt: 'Лена встречается с подругой в ___.', answers: ['кафе'], hint: 'Địa điểm không biến cách.', explanation: 'в кафе — ở quán cà phê.' },
      { prompt: 'Вечером Лена звонит ___.', answers: ['маме'], hint: 'Звонить кому? Cách 3.', explanation: 'звонит маме — gọi điện cho mẹ.' }
    ]},
    speaking: [
      { text: 'Что вы делаете в свободное время?', translation: 'Bạn làm gì lúc rảnh?', tip: 'Nhấn trọng âm: дЕлаете, свобОдное, врЕмя.' },
      { text: 'В субботу я встречаюсь с другом.', translation: 'Thứ Bảy tôi gặp bạn.', tip: 'Nhấn trọng âm: суббОту, встречАюсь, дрУгом.' },
      { text: 'Я люблю играть на гитаре.', translation: 'Tôi thích chơi đàn ghi-ta.', tip: 'Nhấn trọng âm: игрАть, гитАре.' }
    ],
    writing: { title: 'Мои выходные', prompt: 'Что вы делаете в субботу? С кем вы встречаетесь? Где вы гуляете? Что вы любите делать вечером?', guide: 'Viết 4–6 câu về cuối tuần của bạn.', min: 25, max: 55, starters: ['В субботу я…','Утром я…','Я встречаюсь…','Вечером мы…'], sample: 'В субботу я не учусь. Утром я читаю книгу. Днём я встречаюсь с другом. Мы гуляем в парке и разговариваем. Вечером мы смотрим фильм. Я очень люблю выходные.' }
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
lessons.find(l=>l.id==='hello').vocab = [['приве́т','xin chào (thân mật)'],['здра́вствуйте','xin chào (lịch sự)'],['студе́нт','sinh viên nam'],['кни́га','sách'],['стол','bàn'],['слова́рь','từ điển'],['спаси́бо','cảm ơn'],['пожа́луйста','xin mời; làm ơn; không có gì']];
lessons.find(l=>l.id==='family').vocab = [['семья́','gia đình (chủ đề bài)'],['ба́бушка','bà'],['де́душка','ông'],['роди́тели','bố mẹ'],['брат','anh/em trai'],['сестра́','chị/em gái'],['изуча́ть','học, nghiên cứu'],['де́ти','trẻ em; các con']];
lessons.find(l=>l.id==='day').vocab = [['встава́ть','thức dậy'],['идти́','đi bộ (một hướng)'],['ходи́ть','đi bộ (thường xuyên/nhiều hướng)'],['е́хать','đi bằng phương tiện (một hướng)'],['е́здить','đi bằng phương tiện (thường xuyên/nhiều hướng)'],['по́езд','tàu hỏa'],['ра́но','sớm'],['по́здно','muộn']];
lessons.find(l=>l.id==='study').vocab = [['факульте́т','khoa'],['предме́т','môn học; đồ vật'],['исто́рия','lịch sử; câu chuyện'],['литерату́ра','văn học'],['матема́тика','toán học'],['уме́ть','biết làm (có kỹ năng)'],['помога́ть','giúp đỡ'],['сдава́ть экза́мен','thi (dự thi)']];
Object.assign(lessons.find(l=>l.id==='weekend'), {
 subtitle:'Điện ảnh, âm nhạc và sân khấu', topic:'Văn hóa', goal:'Nói về thể loại phim, âm nhạc và sở thích văn hóa.',
 vocab:[['коме́дия','phim/vở hài'],['дете́ктив','truyện/phim trinh thám'],['фильм','phim'],['спекта́кль','vở diễn'],['о́пера','opera'],['джаз','nhạc jazz'],['интере́сный','thú vị'],['смешно́й','buồn cười']],
 listening:{title:'Вечер в кино',text:'В субботу мы с другом идём в кино. Мы хотим посмотреть комедию. Мой друг любит смешные фильмы. Я тоже люблю комедии, но иногда смотрю детективы. После фильма мы идём в кафе.',questions:[
  {prompt:'В субботу друзья идут в ___.',answers:['кино'],hint:'Địa điểm xem phim.',explanation:'идти в кино — đi xem phim.'},
  {prompt:'Они хотят посмотреть ___.',answers:['комедию'],hint:'комедия ở cách 4.',explanation:'посмотреть комедию — xem một phim hài.'},
  {prompt:'После фильма друзья идут в ___.',answers:['кафе'],hint:'Nơi uống cà phê.',explanation:'После фильма мы идём в кафе.'}
 ]},
 reading:{title:'Музыка и театр',text:'Маша любит классическую музыку. В пятницу она идёт в театр с сестрой. Они смотрят балет. Её брат Антон любит джаз. Вечером он слушает музыку дома. В воскресенье вся семья смотрит комедию.',questions:[
  {prompt:'Маша любит ___ музыку.',answers:['классическую'],hint:'классическая ở cách 4.',explanation:'классическую музыку — nhạc cổ điển (cách 4).'},
  {prompt:'В театре сёстры смотрят ___.',answers:['балет'],hint:'Múa ba lê.',explanation:'Они смотрят балет.'},
  {prompt:'Антон любит ___.',answers:['джаз'],hint:'Thể loại âm nhạc của người anh/em.',explanation:'Её брат Антон любит джаз.'}
 ]},
 speaking:[{text:'Я люблю смотреть комедии.',translation:'Tôi thích xem phim hài.',tip:'Nhấn trọng âm: смотрЕть, комЕдии.'},{text:'В пятницу мы идём в театр.',translation:'Thứ Sáu chúng tôi đi xem hát.',tip:'Nhấn trọng âm: пЯтницу, идЁм, теАтр.'},{text:'Мне нравится классическая музыка.',translation:'Tôi thích nhạc cổ điển.',tip:'Nhấn trọng âm: нрАвится, классИческая, мУзыка.'}],
 writing:{title:'Кино и музыка',prompt:'Какие фильмы вы любите? Какую музыку вы слушаете? Вы любите театр? С кем вы ходите в кино?',guide:'Viết 4–6 câu về sở thích phim và âm nhạc.',min:25,max:55,starters:['Я люблю…','Мне нравится…','Обычно я слушаю…','В кино я хожу…'],sample:'Я люблю смотреть комедии. Мне нравятся смешные фильмы. Я часто хожу в кино с другом. Дома я слушаю джаз. Моя сестра любит классическую музыку. Иногда мы вместе ходим в театр.'}
});
const chapterGrammar={
 hello:'Кто это? — Это студент. Что это? — Это словарь. Меня зовут + tên: Tôi tên là… Các câu bổ trợ cũng ôn quê quán: из России, из Вьетнама (cách 2).',
 day:'идти / ехать: một hướng hoặc một chuyến cụ thể (я иду, я еду). ходить / ездить: thói quen hoặc nhiều hướng (я хожу, я езжу). в семь часов — lúc 7 giờ; утром — buổi sáng; вечером — buổi tối.',
 weekend:'Мне нравится фильм / музыка (số ít), мне нравятся фильмы (số nhiều). Я люблю смотреть комедии: люблю + nguyên thể. Фильм начинается в семь часов: Phim bắt đầu lúc 7 giờ.',
 house:'На столе лежит книга. У окна стоит стол. На стене висит картина. Không có: нет + cách 2 (нет телевизора, нет микроволновки). Phân biệt đứng, nằm, treo và dùng đúng giới từ vị trí.',
 study:'мочь / уметь / должен + nguyên thể: могу помочь, умею писать, должен учиться (nữ: должна). читал: quá trình đọc; прочитал: đã đọc xong. Chú ý cả ngữ cảnh và thể động từ.',
 city:'Где? в парке (vị trí, cách 6). Куда? в парк (hướng đến, cách 4). Идите прямо, поверните налево / направо: Đi thẳng, rẽ trái / phải. на автобусе / на такси: đi bằng xe buýt / taxi.'
};
for (const lesson of lessons) {
  if(chapterGrammar[lesson.id])lesson.grammar=chapterGrammar[lesson.id];
  const extra = exerciseBank[lesson.id];
  const ids = ['core','practice','challenge'];
  for (const skill of ['listening','reading','writing']) {
    lesson[`${skill}Sets`] = [lesson[skill],...extra[skill]].map((task,index) => ({...task,id:ids[index],label:['Khởi động','Luyện thêm','Vận dụng'][index]}));
  }
  lesson.speaking = [...lesson.speaking,...extra.speaking];
}
export const alphabet = [
 ['А а','а'],['Б б','бэ'],['В в','вэ'],['Г г','гэ'],['Д д','дэ'],['Е е','е'],['Ё ё','ё'],['Ж ж','жэ'],['З з','зэ'],['И и','и'],['Й й','и краткое'],['К к','ка'],['Л л','эль'],['М м','эм'],['Н н','эн'],['О о','о'],['П п','пэ'],['Р р','эр'],['С с','эс'],['Т т','тэ'],['У у','у'],['Ф ф','эф'],['Х х','ха'],['Ц ц','цэ'],['Ч ч','че'],['Ш ш','ша'],['Щ щ','ща'],['Ъ ъ','твёрдый знак'],['Ы ы','ы'],['Ь ь','мягкий знак'],['Э э','э'],['Ю ю','ю'],['Я я','я']
];
