// PA 2569 Image Collector
// Google Apps Script web app for collecting evidence images for a PA presentation.

const DRIVE_FOLDER_ID = '1qaT2i0RPJfLzaFwKEXnVJ27178SRN7Zz';
const PA_ROOT_NAME = 'PA_2569_Presentation';
const TEMP_FOLDER_NAME = '_PA_upload_tmp_';

var PA_SLIDES = [
  {
    id: 'S01', folder: '01_Cover', title: 'หน้าปก', subtitle: 'ข้อมูลผู้จัดทำและภาพลักษณ์อย่างเป็นทางการ',
    items: [
      {id:'S01_Portrait_Teacher', title:'ภาพ Portrait ครู', hint:'ภาพครูแบบเป็นทางการ แนวตั้ง พื้นหลังเรียบร้อย', priority:'A', required:true},
      {id:'S01_School_Logo', title:'โลโก้โรงเรียน', hint:'ไฟล์ PNG พื้นหลังโปร่งใสหรือภาพความละเอียดสูง', priority:'B', required:true},
      {id:'S01_Classroom_Background', title:'ภาพบรรยากาศห้องเรียนภาษาอังกฤษ', hint:'ภาพแนวนอนสำหรับใช้เป็นพื้นหลังแบบจาง', priority:'C', required:false}
    ]
  },
  {
    id: 'S02', folder: '02_Workload', title: 'ภาระงานและหน้าที่รับผิดชอบ', subtitle: 'การสอน การดูแลนักเรียน และงานโรงเรียน',
    items: [
      {id:'S02_Teaching_English', title:'ภาพกำลังสอนภาษาอังกฤษ', hint:'เห็นครู นักเรียน และกิจกรรมการเรียนรู้ชัดเจน', priority:'A', required:true},
      {id:'S02_Homeroom', title:'ภาพโฮมรูมหรือดูแลนักเรียน', hint:'ภาพกิจกรรมประจำชั้นหรือการดูแลช่วยเหลือ', priority:'B', required:true},
      {id:'S02_School_Duty', title:'ภาพงานโรงเรียน', hint:'ลูกเสือ–เนตรนารี เศรษฐกิจพอเพียง หรือภารกิจที่ได้รับมอบหมาย', priority:'C', required:true}
    ]
  },
  {
    id: 'S03', folder: '03_Learning_Management', title: 'ด้านที่ 1 การจัดการเรียนรู้', subtitle: 'Teacher Input → Practice → Student Action → Assessment',
    items: [
      {id:'S03_Phonics_Teaching_Hero', title:'ภาพหลัก: สอน Phonics นักเรียน ป.1', hint:'ภาพเด่นที่เห็นครูสอนกลุ่มเป้าหมายและสื่อ Phonics', priority:'A', required:true},
      {id:'S03_Active_Learning', title:'นักเรียนลงมือทำกิจกรรม', hint:'เห็นการมีส่วนร่วม ฝึกเสียง เล่นเกม หรือทำงานร่วมกัน', priority:'A', required:true},
      {id:'S03_Phonics_Worksheet', title:'นักเรียนใช้ชุดฝึก/ใบงาน Phonics', hint:'เห็นนักเรียนกำลังใช้สื่อจริง ไม่ใช่เฉพาะภาพเอกสาร', priority:'A', required:true},
      {id:'S03_Student_Reading', title:'นักเรียนอ่านออกเสียง', hint:'ภาพอ่านรายบุคคล หน้าชั้น หรืออ่านกับครู', priority:'A', required:true}
    ]
  },
  {
    id: 'S04', folder: '04_Student_Support', title: 'ด้านที่ 2 การส่งเสริมและสนับสนุนผู้เรียน', subtitle: 'ข้อมูลผู้เรียน ระบบดูแล งานวิชาการ และผู้ปกครอง',
    items: [
      {id:'S04_Home_Visit', title:'ภาพเยี่ยมบ้าน', hint:'ภาพครู นักเรียน และผู้ปกครองในบริบทการเยี่ยมบ้าน', priority:'B', required:true},
      {id:'S04_Homeroom', title:'ภาพกิจกรรมโฮมรูม', hint:'การพูดคุย ดูแล หรือทำกิจกรรมร่วมกับนักเรียน', priority:'B', required:true},
      {id:'S04_Parent_Meeting', title:'ภาพประชุม/พูดคุยผู้ปกครอง', hint:'การประสานความร่วมมือเพื่อติดตามผู้เรียน', priority:'B', required:true},
      {id:'S04_Student_Data', title:'ภาพระบบข้อมูลนักเรียน', hint:'Screenshot Google Form, SDQ หรือสารสนเทศผู้เรียน โดยปิดข้อมูลส่วนตัว', priority:'B', required:true},
      {id:'S04_Parent_Line', title:'ภาพการสื่อสารกับผู้ปกครอง', hint:'Screenshot LINE โดยปิดชื่อ เบอร์โทร และข้อมูลส่วนตัว', priority:'C', required:false}
    ]
  },
  {
    id: 'S05', folder: '05_Professional_Development', title: 'ด้านที่ 3 การพัฒนาตนเองและวิชาชีพ', subtitle: 'Learn → Share → Apply',
    items: [
      {id:'S05_Training', title:'ภาพเข้าร่วมอบรม', hint:'การอบรมด้านภาษาอังกฤษ เทคโนโลยี หรือการจัดการเรียนรู้', priority:'B', required:true},
      {id:'S05_PLC', title:'ภาพ PLC', hint:'ภาพแลกเปลี่ยนเรียนรู้กับครูหรือผู้บริหาร', priority:'B', required:true},
      {id:'S05_Apply_In_Class', title:'ภาพนำความรู้มาใช้สอนจริง', hint:'เชื่อมโยงให้เห็นจากการเรียนรู้สู่ผลที่เกิดในชั้นเรียน', priority:'B', required:true},
      {id:'S05_Certificate', title:'เกียรติบัตรที่เกี่ยวข้อง', hint:'เลือกเฉพาะที่สัมพันธ์กับงาน 1–2 ใบ', priority:'C', required:false}
    ]
  },
  {
    id: 'S06', folder: '06_Outcomes', title: 'ผลลัพธ์ตามมาตรฐานตำแหน่ง', subtitle: 'แสดงพัฒนาการ การมีส่วนร่วม และความมั่นใจของผู้เรียน',
    items: [
      {id:'S06_Before_Work', title:'ผลงาน/การประเมินก่อนพัฒนา', hint:'เลือกนักเรียนคนเดียวกับภาพหลังพัฒนาเพื่อเปรียบเทียบ', priority:'A', required:true},
      {id:'S06_After_Work', title:'ผลงาน/การประเมินหลังพัฒนา', hint:'มุมภาพและชนิดหลักฐานควรเทียบกับ Before ได้', priority:'A', required:true},
      {id:'S06_Student_Confidence', title:'นักเรียนอ่านออกเสียงอย่างมั่นใจ', hint:'เห็นสีหน้า ท่าทาง และการกล้าแสดงออก', priority:'A', required:true},
      {id:'S06_Result_Chart', title:'กราฟผลลัพธ์', hint:'กราฟสรุปพัฒนาการหรือจำนวนผู้ผ่านเกณฑ์', priority:'A', required:true}
    ]
  },
  {
    id: 'S07', folder: '07_Challenge_Problem', title: 'ประเด็นท้าทาย: สภาพปัญหา', subtitle: 'หลักฐาน Baseline ก่อนเริ่มใช้ Phonics จริง',
    items: [
      {id:'S07_Pretest', title:'นักเรียนทำ Pre-test', hint:'ถ่ายนักเรียน ป.1 กลุ่มเป้าหมาย 3 คนก่อนเริ่มพัฒนา', priority:'A', required:true},
      {id:'S07_Reading_Assessment', title:'ครูประเมินการอ่านรายบุคคล', hint:'เห็นกระบวนการฟังและบันทึกผลการอ่าน', priority:'A', required:true},
      {id:'S07_Baseline_Chart', title:'กราฟคะแนนก่อนพัฒนา', hint:'สรุป Baseline ของนักเรียน 3 คน โดยปิดชื่อจริง', priority:'A', required:true},
      {id:'S07_Problem_WorkSample', title:'ตัวอย่างคำ/แบบฝึกที่ยังอ่านไม่ได้', hint:'ตัวอย่างปัญหาจริงก่อนเรียน Phonics', priority:'C', required:false}
    ]
  },
  {
    id: 'S08', folder: '08_Challenge_Process', title: 'ประเด็นท้าทาย: วิธีดำเนินการ', subtitle: 'Analyze → Design → Validate → Teach → Monitor → Remediate → Reassess',
    items: [
      {id:'S08_Curriculum_Analysis', title:'วิเคราะห์หลักสูตร/แผน', hint:'ภาพการวิเคราะห์หลักสูตร หน่วย หรือแผนการจัดการเรียนรู้', priority:'B', required:true},
      {id:'S08_Academic_Review', title:'ฝ่ายวิชาการตรวจแผนหรือสื่อ', hint:'เห็นการตรวจสอบ ให้คำแนะนำ หรือรับรองคุณภาพ', priority:'B', required:true},
      {id:'S08_Phonics_Activity', title:'จัดกิจกรรม Phonics', hint:'เห็นครูและนักเรียนกลุ่มเป้าหมายในกระบวนการจริง', priority:'A', required:true},
      {id:'S08_Phonics_Practice', title:'นักเรียนฝึกเสียง/ผสมเสียง', hint:'เน้นการลงมือฝึกและสื่อที่ใช้', priority:'A', required:true},
      {id:'S08_Peer_Tutoring', title:'เพื่อนช่วยเพื่อน', hint:'นักเรียนช่วยกันฝึกอ่านหรือให้คำแนะนำ', priority:'A', required:true},
      {id:'S08_Remedial_Teaching', title:'สอนซ่อมเสริม', hint:'ภาพการพัฒนารายบุคคลหรือนักเรียนที่ยังไม่ผ่านเกณฑ์', priority:'A', required:true},
      {id:'S08_Excel_Tracking', title:'ตารางติดตามผลใน Excel', hint:'Screenshot คะแนนและการติดตาม โดยปิดชื่อหรือใช้รหัสนักเรียน', priority:'C', required:false}
    ]
  },
  {
    id: 'S09', folder: '09_Challenge_Results', title: 'ประเด็นท้าทาย: ผลลัพธ์และผลกระทบ', subtitle: 'From decoding difficulty → confident English reading',
    items: [
      {id:'S09_Posttest', title:'นักเรียนทำ Post-test', hint:'ใช้กลุ่มเป้าหมาย 3 คนเดิมและบริบทที่เทียบกับ Pre-test ได้', priority:'A', required:true},
      {id:'S09_After_Reading', title:'นักเรียนอ่านภาษาอังกฤษหลังพัฒนา', hint:'ภาพอ่านคำศัพท์หรือข้อความหลังจบกระบวนการ', priority:'A', required:true},
      {id:'S09_Before_After_Chart', title:'กราฟเปรียบเทียบก่อน–หลัง', hint:'Pre-test, Post-test, Growth และจำนวนคนผ่านเกณฑ์ 70%', priority:'A', required:true},
      {id:'S09_Confidence', title:'นักเรียนกล้าอ่าน/พูดหน้าชั้น', hint:'หลักฐานเชิงคุณภาพด้านความมั่นใจและการแสดงออก', priority:'A', required:true},
      {id:'S09_Satisfaction', title:'กราฟความพึงพอใจ', hint:'Infographic หรือกราฟสรุป หากมีการเก็บข้อมูล', priority:'C', required:false}
    ]
  },
  {
    id: 'S10', folder: '10_Summary', title: 'สรุปผลและร่องรอยหลักฐาน', subtitle: 'ภาพรวมสิ่งที่ทำ สิ่งที่ผู้เรียนได้รับ และการพัฒนาต่อไป',
    items: [
      {id:'S10_Phonics_Class', title:'ภาพชั้นเรียน Phonics', hint:'ภาพบรรยากาศรวมที่สื่อถึงการเรียนรู้อย่างมีความสุข', priority:'A', required:true},
      {id:'S10_Student_Work', title:'ภาพผลงานนักเรียน', hint:'เลือกผลงานเด่นที่สะท้อนพัฒนาการ', priority:'A', required:true},
      {id:'S10_Reading_Assessment', title:'ภาพประเมินการอ่าน', hint:'ภาพการติดตามผลหรือประเมินรายบุคคล', priority:'A', required:true},
      {id:'S10_PLC', title:'ภาพ PLC', hint:'ภาพสรุปการแลกเปลี่ยนและขยายผลทางวิชาชีพ', priority:'B', required:true},
      {id:'S10_Home_Visit', title:'ภาพเยี่ยมบ้าน', hint:'ภาพการสนับสนุนผู้เรียนร่วมกับครอบครัว', priority:'B', required:true},
      {id:'S10_Student_Success', title:'ภาพความสำเร็จของนักเรียน', hint:'ภาพเด่นหลังพัฒนา แสดงความมั่นใจหรือความภาคภูมิใจ', priority:'A', required:true},
      {id:'S10_QR_Evidence', title:'QR Code หลักฐานฉบับเต็ม', hint:'QR ที่ทดสอบแล้วว่าเปิดโฟลเดอร์หรือแฟ้มหลักฐานได้', priority:'C', required:true}
    ]
  }
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('คลังภาพ PA 2569')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function getPaRoot() {
  return getOrCreateFolder(DriveApp.getFolderById(DRIVE_FOLDER_ID), PA_ROOT_NAME);
}

function getOrCreateFolder(parent, name) {
  var iterator = parent.getFoldersByName(name);
  return iterator.hasNext() ? iterator.next() : parent.createFolder(name);
}

function findItem(itemId) {
  for (var i = 0; i < PA_SLIDES.length; i++) {
    for (var j = 0; j < PA_SLIDES[i].items.length; j++) {
      if (PA_SLIDES[i].items[j].id === itemId) {
        return {slide: PA_SLIDES[i], item: PA_SLIDES[i].items[j]};
      }
    }
  }
  return null;
}

function getItemFolder(itemId) {
  var found = findItem(itemId);
  if (!found) throw new Error('ไม่พบหัวข้อภาพ: ' + itemId);
  return getOrCreateFolder(getPaRoot(), found.slide.folder);
}

function initPaFolders() {
  var root = getPaRoot();
  for (var i = 0; i < PA_SLIDES.length; i++) getOrCreateFolder(root, PA_SLIDES[i].folder);
  return {success:true, folderUrl:root.getUrl()};
}

function getPaData() {
  try {
    var root = getPaRoot();
    initPaFolders();
    return {success:true, slides:PA_SLIDES, files:getPaFiles_(), folderUrl:root.getUrl()};
  } catch (error) {
    return {success:false, error:String(error)};
  }
}

function safeExtension(name, mimeType) {
  var match = String(name || '').match(/\.([A-Za-z0-9]{1,8})$/);
  if (match) return match[1].toLowerCase();
  var map = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/heic':'heic','image/heif':'heif'};
  return map[mimeType] || 'jpg';
}

function makeFileName(itemId, originalName, mimeType) {
  var stamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd_HHmmss_SSS');
  return itemId + '_' + stamp + '.' + safeExtension(originalName, mimeType);
}

function cleanDescription(value) {
  return String(value || '').trim().slice(0, 1000);
}

function fileResult(file, itemId) {
  var mime = file.getMimeType();
  var id = file.getId();
  return {
    id:id,
    itemId:itemId,
    name:file.getName(),
    mimeType:mime,
    size:file.getSize(),
    sizeText:formatSize(file.getSize()),
    description:file.getDescription() || '',
    thumbnail:'https://drive.google.com/thumbnail?id=' + id + '&sz=w600',
    viewUrl:'https://drive.google.com/file/d/' + id + '/view'
  };
}

function uploadPaFile(formData) {
  try {
    var found = findItem(formData.itemId);
    if (!found) throw new Error('หัวข้อภาพไม่ถูกต้อง');
    if (String(formData.mimeType || '').indexOf('image/') !== 0) throw new Error('รองรับเฉพาะไฟล์รูปภาพ');
    var base64 = String(formData.dataUrl || '').split(',')[1];
    if (!base64) throw new Error('ไม่พบข้อมูลรูปภาพ');
    var bytes = Utilities.base64Decode(base64);
    var fileName = makeFileName(formData.itemId, formData.fileName, formData.mimeType);
    var blob = Utilities.newBlob(bytes, formData.mimeType, fileName);
    var file = getItemFolder(formData.itemId).createFile(blob);
    var description = cleanDescription(formData.description);
    if (description) file.setDescription(description);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return {success:true, file:fileResult(file, formData.itemId)};
  } catch (error) {
    return {success:false, error:String(error)};
  }
}

function getPaFiles_() {
  var result = [];
  for (var i = 0; i < PA_SLIDES.length; i++) {
    var folder = getOrCreateFolder(getPaRoot(), PA_SLIDES[i].folder);
    var validIds = {};
    for (var j = 0; j < PA_SLIDES[i].items.length; j++) validIds[PA_SLIDES[i].items[j].id] = true;
    var files = folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      if (file.getName().slice(-4).toLowerCase() === '.zip') continue;
      var itemId = '';
      var name = file.getName();
      for (var candidate in validIds) {
        if (name.indexOf(candidate + '_') === 0) { itemId = candidate; break; }
      }
      if (!itemId) continue;
      try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (ignore) {}
      result.push(fileResult(file, itemId));
    }
  }
  result.sort(function(a,b){ return b.name.localeCompare(a.name); });
  return result;
}

function deletePaFile(fileId) {
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
    return {success:true};
  } catch (error) {
    return {success:false, error:String(error)};
  }
}

function startPaChunkedUpload(meta) {
  try {
    if (!findItem(meta.itemId)) throw new Error('หัวข้อภาพไม่ถูกต้อง');
    if (String(meta.mimeType || '').indexOf('image/') !== 0) throw new Error('รองรับเฉพาะไฟล์รูปภาพ');
    var sessionId = meta.itemId + '_' + new Date().getTime() + '_' + Math.floor(Math.random()*100000);
    var tempRoot = getOrCreateFolder(getPaRoot(), TEMP_FOLDER_NAME);
    tempRoot.createFolder(sessionId);
    PropertiesService.getScriptProperties().setProperty('pa_' + sessionId, JSON.stringify({
      itemId:meta.itemId,
      fileName:makeFileName(meta.itemId, meta.fileName, meta.mimeType),
      mimeType:meta.mimeType,
      description:cleanDescription(meta.description),
      totalChunks:Number(meta.totalChunks || 0),
      finalized:false
    }));
    return {success:true, sessionId:sessionId};
  } catch (error) {
    return {success:false, error:String(error)};
  }
}

function uploadPaChunk(data) {
  var lock;
  try {
    var props = PropertiesService.getScriptProperties();
    var key = 'pa_' + data.sessionId;
    var raw = props.getProperty(key);
    if (!raw) throw new Error('ไม่พบ upload session');
    var meta = JSON.parse(raw);
    var tempRoot = getOrCreateFolder(getPaRoot(), TEMP_FOLDER_NAME);
    var folders = tempRoot.getFoldersByName(data.sessionId);
    if (!folders.hasNext()) throw new Error('ไม่พบโฟลเดอร์ชั่วคราว');
    var sessionFolder = folders.next();
    var chunkName = 'chunk_' + ('000000' + data.chunkIndex).slice(-6);
    sessionFolder.createFile(Utilities.newBlob(Utilities.base64Decode(data.chunk), 'application/octet-stream', chunkName));

    var count = 0;
    var counter = sessionFolder.getFiles();
    while (counter.hasNext()) { counter.next(); count++; }
    if (count < meta.totalChunks) return {success:true, complete:false};

    lock = LockService.getScriptLock();
    lock.waitLock(30000);
    raw = props.getProperty(key);
    if (!raw) return {success:true, complete:true, alreadyFinalized:true};
    meta = JSON.parse(raw);
    if (meta.finalized) return {success:true, complete:false};
    meta.finalized = true;
    props.setProperty(key, JSON.stringify(meta));
    lock.releaseLock(); lock = null;

    var chunks = [];
    var iterator = sessionFolder.getFiles();
    while (iterator.hasNext()) chunks.push(iterator.next());
    chunks.sort(function(a,b){ return a.getName().localeCompare(b.getName()); });
    var byteArrays = [], total = 0;
    for (var i = 0; i < chunks.length; i++) {
      byteArrays[i] = chunks[i].getBlob().getBytes();
      total += byteArrays[i].length;
    }
    var combined = new Uint8Array(total), offset = 0;
    for (var j = 0; j < byteArrays.length; j++) {
      combined.set(byteArrays[j], offset);
      offset += byteArrays[j].length;
    }
    var file = getItemFolder(meta.itemId).createFile(Utilities.newBlob(combined, meta.mimeType, meta.fileName));
    if (meta.description) file.setDescription(meta.description);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    sessionFolder.setTrashed(true);
    props.deleteProperty(key);
    return {success:true, complete:true, file:fileResult(file, meta.itemId)};
  } catch (error) {
    if (lock) try { lock.releaseLock(); } catch (ignore) {}
    return {success:false, error:String(error)};
  }
}

function createPaZip() {
  try {
    var blobs = [];
    collectBlobs_(getPaRoot(), '', blobs);
    if (!blobs.length) return {success:false, error:'ยังไม่มีรูปภาพ'};
    var root = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var old = root.getFilesByName('PA_2569_Presentation_Images.zip');
    while (old.hasNext()) old.next().setTrashed(true);
    var zip = root.createFile(Utilities.zip(blobs, 'PA_2569_Presentation_Images.zip'));
    zip.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return {success:true, downloadUrl:'https://drive.google.com/uc?export=download&id=' + zip.getId()};
  } catch (error) {
    return {success:false, error:String(error)};
  }
}

function collectBlobs_(folder, prefix, blobs) {
  if (folder.getName() === TEMP_FOLDER_NAME) return;
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().slice(-4).toLowerCase() === '.zip') continue;
    var blob = file.getBlob();
    blob.setName(prefix ? prefix + '/' + file.getName() : file.getName());
    blobs.push(blob);
  }
  var folders = folder.getFolders();
  while (folders.hasNext()) {
    var sub = folders.next();
    if (sub.getName() === TEMP_FOLDER_NAME) continue;
    collectBlobs_(sub, (prefix ? prefix + '/' : '') + sub.getName(), blobs);
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}
