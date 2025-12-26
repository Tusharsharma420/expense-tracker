function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const params = e.parameter;
    const action = params.action;
    
    // Parse POST body if available
    let postData = {};
    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback for form-encoded
        postData = params;
      }
    }

    // Merge params
    const data = { ...params, ...postData };
    
    let result = {};

    if (action === "addTransaction") {
      result = addTransaction(data);
    } else if (action === "getTransactions") {
      result = getTransactions(data);
    } else if (action === "getFamilyConfig") {
      result = getFamilyConfig(data);
    } else if (action === "setup") {
      result = setupSheets();
    } else {
      result = { status: "error", message: "Unknown action" };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);   
  } finally {
    lock.releaseLock();
  }
}

// --- CORE FUNCTIONS ---

function addTransaction(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Transactions");
  
  if (!sheet) return { status: "error", message: "Sheet 'Transactions' not found. Run setup first." };

  // Columns: txn_id, family_id, person, type, amount, category, date, note, created_at
  const txn_id = data.txn_id || "TXN" + new Date().getTime();
  const family_id = data.family_id || "FAM001"; // Default for now
  
  sheet.appendRow([
    txn_id,
    family_id,
    data.person,
    data.type,
    data.amount,
    data.category,
    data.date,
    data.note,
    new Date()
  ]);

  return { status: "success", txn_id: txn_id };
}

function getTransactions(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Transactions");
  if (!sheet) return { status: "error", message: "Sheet not found" };

  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift(); // Remove header

  // Transform to details
  const transactions = rows.map(row => {
    return {
      txn_id: row[0],
      family_id: row[1],
      person: row[2],
      type: row[3],
      amount: row[4],
      category: row[5],
      date: row[6], // Keep raw date string/object
      note: row[7]
    };
  }).reverse(); // Newest first

  // Simple limit
  const limit = data.limit ? parseInt(data.limit) : 50;
  
  return { status: "success", transactions: transactions.slice(0, limit) };
}

function getFamilyConfig(data) {
   // Placeholder for family config (categories, members)
   // In a real app we would read from 'Families' and 'Categories' sheets
   return {
     status: "success",
     categories: ["Food", "Transport", "Bills", "Entertainment", "Shopping", "Health"],
     members: ["User 1", "User 2"] 
   };
}

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheets = [
    { name: "Transactions", headers: ["txn_id", "family_id", "person", "type", "amount", "category", "date", "note", "created_at"] },
    { name: "Families", headers: ["family_id", "name", "created_at"] },
    { name: "Persons", headers: ["person_id", "family_id", "name", "role"] }
  ];

  sheets.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
      sheet.appendRow(def.headers);
    }
  });

  return { status: "success", message: "Sheets created" };
}
