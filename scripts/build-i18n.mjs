import{readFile,writeFile}from'node:fs/promises';
const original=JSON.parse(await readFile('scripts/english-translations.json','utf8'));
const vi={};for(const[v,en]of Object.entries(original))if(en&&!vi[en])vi[en]=v;
Object.assign(vi,{
 'Credits and sources':'Nguồn và ghi công',
 'Your Aymi Russian.':'Aymi Russian của bạn.','The Aymi Russian app':'Ứng dụng Aymi Russian',
 'Google Translate voice for practice passages':'Giọng Google Translate cho bài luyện',
 'Original supplementary practice':'Bài tập bổ trợ tự biên soạn',
 'Audio is ready. Tap Play on the audio controls.':'Audio đã sẵn sàng. Chạm Phát trên trình phát audio.',
 'Repeat audio':'Lặp lại audio','Preparing audio':'Đang chuẩn bị audio','Russian practice audio':'Audio luyện tiếng Nga',
 'Listening · topic speaking · full-sentence reading · writing':'Nghe · nói theo chủ đề · đọc và trả lời bằng câu · viết',
 '8 speaking topics':'8 chủ đề nói','Practiced':'Đã luyện','Speaking session saved':'Đã lưu lượt luyện nói',
 'Audio ready. Use Play, the timeline, or the 5-second buttons.':'Audio đã sẵn sàng. Dùng nút Phát, thanh thời gian hoặc nút tua 5 giây.',
 'Finished. Replay or drag the timeline to listen again.':'Đã nghe xong. Phát lại hoặc kéo thanh thời gian để nghe lại.',
 'Compare your sentence with the model. Other correct wording may need a teacher’s review.':'So sánh với câu mẫu. Cách diễn đạt đúng khác có thể cần giáo viên xem lại.',
 'Aymi Russian home':'Trang chủ Aymi Russian','Listening':'Nghe','Speaking':'Nói','Reading':'Đọc','Writing':'Viết',
 'Overview':'Tổng quan','Lessons':'Bài học','Learning path':'Lộ trình học','Vocabulary':'Từ vựng','Grammar':'Ngữ pháp',
 'Speaking topics':'Chủ đề nói','Alphabet':'Bảng chữ cái','Progress':'Tiến độ','Settings':'Cài đặt','Settings & help':'Cài đặt & hướng dẫn',
 'Interface language':'Ngôn ngữ giao diện','English':'Tiếng Anh','Vietnamese':'Tiếng Việt','Language':'Ngôn ngữ',
 'Listen':'Nghe','Replay':'Nghe lại','Pause':'Tạm dừng','Play':'Phát','Previous':'Trước','Next':'Tiếp theo',
 'Lesson':'Bài','LESSON':'BÀI','Page':'Trang','Set':'Bộ','sets':'bộ','words':'từ','cards':'thẻ',
 'instead of':'thay','Warm-up':'Khởi động','Practice':'Luyện thêm','Challenge':'Vận dụng',
 'Full answer':'Trả lời đầy đủ','Model answer':'Câu trả lời mẫu','Show model':'Xem câu mẫu','Check answers':'Kiểm tra đáp án',
 'Record':'Ghi âm','Start speaking':'Bắt đầu nói','Stop':'Dừng','Review transcript':'Kiểm tra bản nhận dạng',
 'Check and correct':'Kiểm tra và sửa','Corrected version':'Bản đã sửa','Your transcript':'Lời nói đã nhận dạng',
 'Topic checklist':'Nội dung cần nói','Guiding questions':'Câu hỏi gợi ý','Model response':'Bài nói mẫu',
 'Vocabulary cards':'Thẻ từ vựng','Flip card':'Lật thẻ','Show meaning':'Xem nghĩa','Search vocabulary':'Tìm từ vựng',
 'All lessons':'Tất cả bài học','All word types':'Tất cả loại từ','Textbook glossary':'Từ vựng trong sách',
 'Saved on this device':'Đã lưu trên thiết bị','Listen to model':'Nghe mẫu','Hide meaning':'Ẩn nghĩa',
 'Reading passage':'Đoạn văn đọc','Questions and answers':'Câu hỏi và trả lời','Write a complete Russian sentence.':'Viết một câu tiếng Nga đầy đủ.',
 'Study notes':'Ghi chú ngữ pháp','Examples':'Ví dụ','Practice grammar':'Luyện ngữ pháp','Case reference':'Bảng tra các cách',
 'Nominative':'Danh cách','Genitive':'Sinh cách','Dative':'Tặng cách','Accusative':'Đối cách','Instrumental':'Công cụ cách','Prepositional':'Giới cách',
 'Jump to a lesson':'Chọn bài học','14 textbook lessons':'14 bài trong giáo trình','Your study corner':'Góc học tập của bạn'
});
await writeFile('NgaNgo.Web/wwwroot/js/i18n-dictionary.js','// English to Vietnamese interface/content dictionary. Russian text is preserved.\nexport const vietnamese='+JSON.stringify(vi,null,2)+';\n');
console.log(Object.keys(vi).length+' Vietnamese interface translations ready.');
