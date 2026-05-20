// ============================
// VTR Image & Video Uploader v5
// Google Apps Script - Code.gs
// รองรับรูปภาพ + วิดีโอ คุณภาพต้นฉบับ
// ============================

const DRIVE_FOLDER_ID = '1NU7kkwHj2tEbhq2uChFUz8_tHNg6JI6D';

// ขนาดจำกัดต่อ chunk (Apps Script max payload ~50MB แต่ใช้ 30MB ให้ปลอดภัย)
const CHUNK_SIZE_LIMIT = 30 * 1024 * 1024; // 30MB in bytes

var FOLDER_STRUCTURE = {
  "org1": {
    name: "องค์ประกอบที่ 1 - ประสิทธิภาพและประสิทธิผล",
    children: {
      "d1": {
        name: "ด้าน 1 - การจัดการเรียนรู้",
        children: {
          "1-1": "1.1 วิเคราะห์หลักสูตร จัดทำรายวิชาและหน่วยการเรียนรู้",
          "1-2": "1.2 ออกแบบการจัดการเรียนรู้เน้นผู้เรียนเป็นสำคัญ",
          "1-3": "1.3 จัดกิจกรรมการเรียนรู้",
          "1-4": "1.4 สื่อ เทคโนโลยี และแหล่งเรียนรู้",
          "1-5": "1.5 วัดและประเมินผลการเรียนรู้",
          "1-6": "1.6 จัดบรรยากาศส่งเสริมผู้เรียน",
          "1-7": "1.7 อบรมบ่มนิสัยคุณธรรม จริยธรรม"
        }
      },
      "d2": {
        name: "ด้าน 2 - ส่งเสริมและสนับสนุนการจัดการเรียนรู้",
        children: {
          "2-1": "2.1 ข้อมูลสารสนเทศของผู้เรียน",
          "2-2": "2.2 ระบบดูแลช่วยเหลือนักเรียน",
          "2-3": "2.3 ร่วมปฏิบัติงานวิชาการของสถานศึกษา",
          "2-4": "2.4 ประสานความร่วมมือกับผู้ปกครอง"
        }
      },
      "d3": {
        name: "ด้าน 3 - พัฒนาตนเองและวิชาชีพ",
        children: {
          "3-1": "3.1 พัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง",
          "3-2": "3.2 แลกเปลี่ยนเรียนรู้ทางวิชาชีพ",
          "3-3": "3.3 นำความรู้มาใช้พัฒนาการจัดการเรียนรู้"
        }
      }
    }
  },
  "org2": {
    name: "องค์ประกอบที่ 2 - มีส่วนร่วมพัฒนาการศึกษา",
    children: {
      "org2": "งานที่ได้รับมอบหมายจากผู้บังคับบัญชา"
    }
  },
  "org3": {
    name: "องค์ประกอบที่ 3 - วินัย คุณธรรม จริยธรรม จรรยาบรรณ",
    children: {
      "v-1":  "3.1 ยึดมั่นสถาบันหลักของประเทศ",
      "v-2":  "3.2 ซื่อสัตย์สุจริต รับผิดชอบต่อหน้าที่",
      "v-3":  "3.3 กล้าคิด กล้าตัดสินใจ กล้าแสดงออก",
      "v-4":  "3.4 จิตอาสา จิตสาธารณะ",
      "v-5":  "3.5 มุ่งผลสัมฤทธิ์ของงาน",
      "v-6":  "3.6 ปฏิบัติหน้าที่อย่างเป็นธรรม",
      "v-7":  "3.7 ดำรงตนเป็นแบบอย่างที่ดี",
      "v-8":  "3.8 เคารพศักดิ์ศรีความเป็นมนุษย์ สิทธิเด็ก",
      "v-9":  "3.9 ปฏิบัติตามจรรยาบรรณวิชาชีพ",
      "v-10": "3.10 มีวินัยและรักษาวินัย"
    }
  }
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('VTR Image & Video Uploader')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

// ===== Init Folders =====
function initFolders() {
  var root = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  for (var orgKey in FOLDER_STRUCTURE) {
    var orgDef = FOLDER_STRUCTURE[orgKey];
    var orgFolder = getOrCreateFolder(root, orgDef.name);
    for (var childKey in orgDef.children) {
      var child = orgDef.children[childKey];
      if (typeof child === 'string') {
        getOrCreateFolder(orgFolder, child);
      } else {
        var danFolder = getOrCreateFolder(orgFolder, child.name);
        for (var topicKey in child.children) {
          getOrCreateFolder(danFolder, child.children[topicKey]);
        }
      }
    }
  }
  Logger.log('โครงสร้างโฟลเดอร์สร้างเสร็จแล้ว');
}

function getOrCreateFolder(parent, name) {
  var iter = parent.getFoldersByName(name);
  if (iter.hasNext()) return iter.next();
  return parent.createFolder(name);
}

function getTopicFolder(topicId) {
  var root = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  for (var orgKey in FOLDER_STRUCTURE) {
    var orgDef = FOLDER_STRUCTURE[orgKey];
    for (var childKey in orgDef.children) {
      var child = orgDef.children[childKey];
      if (typeof child === 'string') {
        if (childKey === topicId) {
          return getOrCreateFolder(getOrCreateFolder(root, orgDef.name), child);
        }
      } else {
        for (var topicKey in child.children) {
          if (topicKey === topicId) {
            var orgFolder = getOrCreateFolder(root, orgDef.name);
            var danFolder = getOrCreateFolder(orgFolder, child.name);
            return getOrCreateFolder(danFolder, child.children[topicKey]);
          }
        }
      }
    }
  }
  return root;
}

// ===== Upload (ไฟล์เล็ก < 30MB) =====
function uploadFile(formData) {
  try {
    var folder = getTopicFolder(formData.topicId);
    var base64 = formData.dataUrl.split(',')[1];
    var decoded = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(decoded, formData.mimeType, formData.fileName);

    var ext = formData.fileName.split('.').pop();
    var timestamp = new Date().getTime();
    var newFileName = formData.topicId + '_' + timestamp + '.' + ext;
    blob.setName(newFileName);

    var file = folder.createFile(blob);
    // Make file accessible to anyone with the link so thumbnail URLs load
    // on all browsers (Safari on iPad blocks cross-site auth cookies).
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileId = file.getId();
    var isVideo = formData.mimeType.indexOf('video') === 0;

    return {
      success: true,
      fileId: fileId,
      fileName: newFileName,
      isVideo: isVideo,
      mimeType: formData.mimeType,
      thumbnail: isVideo
        ? 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w400'
        : 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w400',
      previewUrl: isVideo
        ? 'https://drive.google.com/file/d/' + fileId + '/preview'
        : null
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ===== Chunked Upload (ไฟล์ใหญ่) =====
// ใช้ DriveApp ล้วน — ไม่ใช้ UrlFetchApp เพื่อรองรับ ANYONE_ANONYMOUS web app
//
// วิธีการ:
//   startChunkedUpload → สร้าง temp folder ใน Drive, return sessionId + fileName
//   uploadChunk        → บันทึกแต่ละ chunk เป็นไฟล์เล็กๆ ใน temp folder
//                        chunk สุดท้าย: รวมทุก chunk → สร้างไฟล์จริง → ลบ temp folder

var TEMP_FOLDER_NAME = '_upload_tmp_';

function getTempFolder() {
  var root = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  var iter = root.getFoldersByName(TEMP_FOLDER_NAME);
  return iter.hasNext() ? iter.next() : root.createFolder(TEMP_FOLDER_NAME);
}

function startChunkedUpload(formData) {
  try {
    var ext = formData.fileName.split('.').pop();
    var timestamp = new Date().getTime();
    var idKey = formData.topicId || formData.sectionId || 'file';
    var newFileName = idKey + '_' + timestamp + '.' + ext;

    // สร้าง session folder ใน temp เพื่อเก็บ chunks
    var sessionId = idKey + '_' + timestamp;
    var tmpFolder = getTempFolder();
    tmpFolder.createFolder(sessionId);

    // เก็บ metadata ใน PropertiesService
    var props = PropertiesService.getScriptProperties();
    props.setProperty('session_' + sessionId, JSON.stringify({
      fileName: newFileName,
      mimeType: formData.mimeType,
      topicId: formData.topicId || '',
      sectionId: formData.sectionId || '',
      totalChunks: formData.totalChunks || 0,
      finalized: false
    }));

    return { success: true, sessionId: sessionId, fileName: newFileName };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// data: { sessionId, chunk (base64), chunkIndex, mimeType }
// Parallel-safe: assembly is triggered when file count in session folder === totalChunks,
// not by an "isLast" flag, so chunks can arrive in any order.
function uploadChunk(data) {
  try {
    var props = PropertiesService.getScriptProperties();
    var metaKey = 'session_' + data.sessionId;
    var rawMeta = props.getProperty(metaKey);
    if (!rawMeta) return { success: false, error: 'Session not found: ' + data.sessionId };
    var meta = JSON.parse(rawMeta);

    // บันทึก chunk ลงใน temp folder ของ session นี้
    var tmpFolder = getTempFolder();
    var iter = tmpFolder.getFoldersByName(data.sessionId);
    if (!iter.hasNext()) return { success: false, error: 'Session folder missing' };
    var sessionFolder = iter.next();

    var decoded = Utilities.base64Decode(data.chunk);
    var chunkBlob = Utilities.newBlob(decoded, 'application/octet-stream', 'chunk_' + String(data.chunkIndex).padStart(6, '0'));
    sessionFolder.createFile(chunkBlob);

    // นับจำนวน chunk ที่เก็บใน session folder
    var count = 0;
    var countIter = sessionFolder.getFiles();
    while (countIter.hasNext()) { countIter.next(); count++; }

    if (count < meta.totalChunks) {
      return { success: true, complete: false };
    }

    // --- ครบทุก chunk แล้ว: ต้องรวมไฟล์ ---
    // Lock เพื่อกันไม่ให้สอง chunk ที่มาถึงพร้อมกันทั้งคู่ trigger assembly
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(30000);
    } catch (lockErr) {
      return { success: true, complete: false };
    }
    try {
      // อ่าน meta ใหม่หลัง lock — ถ้ามี chunk อื่น finalized ไปแล้ว ให้บอก client ว่าเสร็จ
      var freshRaw = props.getProperty(metaKey);
      if (!freshRaw) {
        // session ถูกลบไปแล้ว = finalize เสร็จแล้ว
        return { success: true, complete: true, alreadyFinalized: true };
      }
      var freshMeta = JSON.parse(freshRaw);
      if (freshMeta.finalized) {
        return { success: true, complete: true, alreadyFinalized: true };
      }
      freshMeta.finalized = true;
      props.setProperty(metaKey, JSON.stringify(freshMeta));
      meta = freshMeta;
    } finally {
      lock.releaseLock();
    }

    // --- รวมทุก chunk แล้วสร้างไฟล์จริง ---
    // เรียง chunks ตามชื่อ (chunk_000000, chunk_000001, ...)
    var chunkFiles = [];
    var allFiles = sessionFolder.getFiles();
    while (allFiles.hasNext()) chunkFiles.push(allFiles.next());
    chunkFiles.sort(function(a, b) { return a.getName() < b.getName() ? -1 : 1; });

    // รวม bytes แบบ O(n) ด้วย Uint8Array (แทนที่ push byte ทีละตัวซึ่งเป็น O(n²))
    var byteArrays = new Array(chunkFiles.length);
    var total = 0;
    for (var i = 0; i < chunkFiles.length; i++) {
      byteArrays[i] = chunkFiles[i].getBlob().getBytes();
      total += byteArrays[i].length;
    }
    var combined = new Uint8Array(total);
    var offset = 0;
    for (var k = 0; k < byteArrays.length; k++) {
      combined.set(byteArrays[k], offset);
      offset += byteArrays[k].length;
    }

    // สร้างไฟล์จริงในโฟลเดอร์ปลายทาง
    var destFolder = meta.sectionId ? getWsFolder(meta.sectionId) : getTopicFolder(meta.topicId);
    var finalBlob = Utilities.newBlob(combined, meta.mimeType, meta.fileName);
    var file = destFolder.createFile(finalBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileId = file.getId();

    // ลบ temp session folder และ property
    sessionFolder.setTrashed(true);
    props.deleteProperty(metaKey);

    var isVideo = meta.mimeType.indexOf('video') === 0;
    return {
      success: true,
      complete: true,
      fileId: fileId,
      fileName: meta.fileName,
      isVideo: isVideo,
      mimeType: meta.mimeType,
      thumbnail: 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w400',
      previewUrl: isVideo ? 'https://drive.google.com/file/d/' + fileId + '/preview' : null
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ===== Get files =====
function getUploadedFiles() {
  try {
    var root = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var result = [];
    collectFiles(root, result);
    result.sort(function(a, b) { return a.name.localeCompare(b.name); });
    return result;
  } catch (e) {
    return [];
  }
}

function collectFiles(folder, result) {
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    if (name.endsWith('.zip')) continue;

    var id = file.getId();
    // Ensure link-sharing is on so thumbnail URLs load without auth cookies
    // (fixes broken thumbnails on iPad Safari / browsers with cross-site cookie blocking).
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}
    var mime = file.getMimeType();
    var parts = name.split('_');
    parts.pop();
    var topicId = parts.join('_');
    var isVideo = mime.indexOf('video') === 0;
    var sizeBytes = file.getSize();

    result.push({
      name: name,
      id: id,
      topicId: topicId,
      mimeType: mime,
      isVideo: isVideo,
      size: sizeBytes,
      sizeText: formatSize(sizeBytes),
      thumbnail: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w400',
      previewUrl: isVideo ? 'https://drive.google.com/file/d/' + id + '/preview' : null
    });
  }
  var subs = folder.getFolders();
  while (subs.hasNext()) { collectFiles(subs.next(), result); }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}

// ===== Delete =====
function deleteFile(fileId) {
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ===== Replace =====
function replaceFile(formData) {
  try {
    if (formData.oldFileId) DriveApp.getFileById(formData.oldFileId).setTrashed(true);
    return uploadFile(formData);
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ===== ZIP =====
function createZip() {
  try {
    var root = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var blobs = [];
    collectBlobs(root, '', blobs);

    if (blobs.length === 0) return { success: false, error: 'ไม่มีไฟล์' };

    var oldFiles = root.getFilesByName('VTR_Slide_Images.zip');
    while (oldFiles.hasNext()) { oldFiles.next().setTrashed(true); }

    var zipBlob = Utilities.zip(blobs, 'VTR_Slide_Images.zip');
    var zipFile = root.createFile(zipBlob);
    zipFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      downloadUrl: 'https://drive.google.com/uc?export=download&id=' + zipFile.getId()
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ===== Supervision Checklist Folder Structure =====
var WS_ROOT_NAME = 'นิเทศเปิดภาคเรียนที่1_2569';
var WS_FOLDERS = {
  // ด้านที่ 1 การบริหารจัดการ
  's1-1':  '01_1.1_วางแผนนโยบาย_สพฐ',
  's1-2':  '02_1.2_ประสานเครือข่าย',
  's1-3':  '03_1.3_ตรวจสอบข้อมูล_ทร14',
  's1-4':  '04_1.4_ประชุมครูปฏิทินดำเนินงาน',
  's1-5':  '05_1.5_คำสั่งจัดชั้นเรียนธุรการ',
  's1-6':  '06_1.6_เรียนรวม',
  's1-7':  '07_1.7_งบอาหารกลางวัน',
  's1-8':  '08_1.8_ThaiSchoolLunch',
  's1-9':  '09_1.9_อาหารเสริมนม',
  's1-10': '10_1.10_ระบบความปลอดภัย',
  // ด้านที่ 2 ปฐมวัย
  's2-1':  '11_2.1.1_หลักสูตรปฐมวัย',
  's2-2':  '12_2.1.2_แผนประสบการณ์สื่อ',
  's2-3':  '13_2.1.3_ความปลอดภัยห้องเรียน',
  's2-4':  '14_2.1.4_สภาพแวดล้อมห้องเรียน',
  's2-5':  '15_2.1.5_สภาพแวดล้อมนอกห้อง',
  's2-6':  '16_2.1.6_ห้องน้ำปฐมวัย',
  // ด้านที่ 2 ขั้นพื้นฐาน
  's2-7':  '17_2.2.1_หลักสูตรขั้นพื้นฐาน',
  's2-8':  '18_2.2.2_ออกแบบหน่วยการเรียนรู้',
  's2-9':  '19_2.2.3_ตารางสอนธุรการชั้นเรียน',
  's2-10': '20_2.2.4_ActiveLearning',
  's2-11': '21_2.2.5_DLTV_DLIT',
  's2-12': '22_2.2.6_ชุดฝึกทักษะความฉลาดรู้',
  // ด้านที่ 3 อาคารสถานที่
  's3-1':  '23_3.1_สภาพแวดล้อมสะอาดสวยงาม',
  's3-2':  '24_3.2_อาคารสนามแข็งแรง',
  's3-3':  '25_3.3_ห้องเรียนActiveLearning',
  's3-4':  '26_3.4_LivingBoard',
  's3-5':  '27_3.5_แสงสว่างอากาศ',
  's3-6':  '28_3.6_ห้องสมุดปฏิบัติการ',
  's3-7':  '29_3.7_โรงอาหารน้ำดื่ม',
  's3-8':  '30_3.8_ไฟฟ้าน้ำประปา',
  's3-9':  '31_3.9_ห้องน้ำสุขาดี',
  's3-10': '32_3.10_จอดรถความปลอดภัย',
  // ด้านที่ 4 ผู้เรียน
  's4-1':  '33_4.1_จัดซื้อหนังสือเรียน',
  's4-2':  '34_4.2_หนังสือปฐมวัย',
  's4-3':  '35_4.3_หนังสือประถม',
  's4-4':  '36_4.4_หนังสือมัธยม',
  's4-5':  '37_4.5_อุปกรณ์การเรียน',
  's4-6':  '38_4.6_เครื่องแบบนักเรียน',
  's4-7':  '39_4.7_อาหารกลางวันนม',
  's4-8':  '40_4.8_แต่งกายสะอาด',
  's4-9':  '41_4.9_ความพร้อมเรียน',
  's4-10': '42_4.10_นักเรียนมีความสุข'
};

function getWsRoot() {
  var root = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  return getOrCreateFolder(root, WS_ROOT_NAME);
}

function getWsFolder(sectionId) {
  var name = WS_FOLDERS[sectionId];
  if (!name) return getWsRoot();
  return getOrCreateFolder(getWsRoot(), name);
}

function uploadWsFile(formData) {
  try {
    var folder = getWsFolder(formData.sectionId);
    var base64 = formData.dataUrl.split(',')[1];
    var decoded = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(decoded, formData.mimeType, formData.fileName);
    var ext = formData.fileName.split('.').pop();
    var timestamp = new Date().getTime();
    var newFileName = formData.sectionId + '_' + timestamp + '.' + ext;
    blob.setName(newFileName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileId = file.getId();
    var isVideo = formData.mimeType.indexOf('video') === 0;
    return {
      success: true,
      fileId: fileId,
      fileName: newFileName,
      isVideo: isVideo,
      mimeType: formData.mimeType,
      thumbnail: 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w400',
      previewUrl: isVideo ? 'https://drive.google.com/file/d/' + fileId + '/preview' : null
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function replaceWsFile(formData) {
  try {
    if (formData.oldFileId) DriveApp.getFileById(formData.oldFileId).setTrashed(true);
    return uploadWsFile(formData);
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getWsFiles() {
  try {
    var wsRoot = getWsRoot();
    // Build reverse map: folder name -> sectionId
    var nameToId = {};
    for (var key in WS_FOLDERS) nameToId[WS_FOLDERS[key]] = key;
    var result = [];
    var subs = wsRoot.getFolders();
    while (subs.hasNext()) {
      var sub = subs.next();
      var sid = nameToId[sub.getName()];
      var files = sub.getFiles();
      while (files.hasNext()) {
        var file = files.next();
        if (file.getName().endsWith('.zip')) continue;
        var id = file.getId();
        try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}
        var mime = file.getMimeType();
        var isVideo = mime.indexOf('video') === 0;
        result.push({
          name: file.getName(),
          id: id,
          sectionId: sid || '',
          mimeType: mime,
          isVideo: isVideo,
          size: file.getSize(),
          sizeText: formatSize(file.getSize()),
          thumbnail: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w400',
          previewUrl: isVideo ? 'https://drive.google.com/file/d/' + id + '/preview' : null
        });
      }
    }
    result.sort(function(a, b) { return a.name.localeCompare(b.name); });
    return result;
  } catch (e) {
    return [];
  }
}

function createWsZip() {
  try {
    var wsRoot = getWsRoot();
    var blobs = [];
    collectBlobs(wsRoot, '', blobs);
    if (blobs.length === 0) return { success: false, error: 'ไม่มีไฟล์' };
    var root = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var oldFiles = root.getFilesByName('WhiteSchool_Images.zip');
    while (oldFiles.hasNext()) { oldFiles.next().setTrashed(true); }
    var zipBlob = Utilities.zip(blobs, 'WhiteSchool_Images.zip');
    var zipFile = root.createFile(zipBlob);
    zipFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return { success: true, downloadUrl: 'https://drive.google.com/uc?export=download&id=' + zipFile.getId() };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function collectBlobs(folder, prefix, blobs) {
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().endsWith('.zip')) continue;
    var blob = file.getBlob();
    var zipName = prefix ? prefix + '/' + file.getName() : file.getName();
    blob.setName(zipName);
    blobs.push(blob);
  }
  var subs = folder.getFolders();
  while (subs.hasNext()) {
    var sub = subs.next();
    collectBlobs(sub, (prefix ? prefix + '/' : '') + sub.getName(), blobs);
  }
}