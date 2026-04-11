// ============================
// VTR Image & Video Uploader v5
// Google Apps Script - Code.gs
// รองรับรูปภาพ + วิดีโอ คุณภาพต้นฉบับ
// ============================

const DRIVE_FOLDER_ID = '1hGyiqSy6auPnOGCI0fGDzrssSsIswoLR';

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
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
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
// เริ่มต้น: สร้างไฟล์เปล่า แล้ว return fileId
function startChunkedUpload(formData) {
  try {
    var folder = getTopicFolder(formData.topicId);
    var ext = formData.fileName.split('.').pop();
    var timestamp = new Date().getTime();
    var newFileName = formData.topicId + '_' + timestamp + '.' + ext;

    // สร้างไฟล์เปล่าเพื่อจอง
    var placeholder = Utilities.newBlob('', formData.mimeType, newFileName);
    var file = folder.createFile(placeholder);

    return {
      success: true,
      fileId: file.getId(),
      fileName: newFileName
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// อัปโหลดทีละ chunk แล้วต่อท้ายไฟล์
function uploadChunk(data) {
  try {
    var decoded = Utilities.base64Decode(data.chunk);
    var existingFile = DriveApp.getFileById(data.fileId);

    if (data.chunkIndex === 0) {
      // chunk แรก: เขียนทับไฟล์เปล่า
      var blob = Utilities.newBlob(decoded, data.mimeType, existingFile.getName());
      
      // ใช้ Drive API advanced service เพื่ออัปเดตเนื้อหา
      Drive.Files.update({}, data.fileId, blob);
    } else {
      // chunk ถัดไป: ดึงเนื้อหาเก่ามาต่อ
      var existingBlob = existingFile.getBlob();
      var existingBytes = existingBlob.getBytes();
      
      // ต่อ bytes
      var combined = [];
      for (var i = 0; i < existingBytes.length; i++) combined.push(existingBytes[i]);
      for (var j = 0; j < decoded.length; j++) combined.push(decoded[j]);
      
      var newBlob = Utilities.newBlob(combined, data.mimeType, existingFile.getName());
      Drive.Files.update({}, data.fileId, newBlob);
    }

    // ถ้าเป็น chunk สุดท้าย return ข้อมูลครบ
    if (data.isLast) {
      var fileId = data.fileId;
      var isVideo = data.mimeType.indexOf('video') === 0;
      return {
        success: true,
        complete: true,
        fileId: fileId,
        fileName: existingFile.getName(),
        isVideo: isVideo,
        mimeType: data.mimeType,
        thumbnail: 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w400',
        previewUrl: isVideo
          ? 'https://drive.google.com/file/d/' + fileId + '/preview'
          : null
      };
    }

    return { success: true, complete: false };
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