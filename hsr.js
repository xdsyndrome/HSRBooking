var count = 0;
var serialNo = 0;

document.addEventListener("DOMContentLoaded", function() {
    /*
    Load database
    Load event listeners for buttons
    */

    var db = loadDB();
    const submitName = document.querySelector("#bookFieldName");
    const submitPhone = document.querySelector("#bookFieldPhone");
    const deleteNo = document.querySelector("#deleteField");
    const submitResponse = document.querySelector("#submitResponse");
    const deleteResponse = document.querySelector("#deleteResponse");
    var tbodyRef = document.querySelector("#BookingTableBody");
    var theadRef = document.querySelector("#BookingTableHead");
    var table = document.querySelector("#bookingTable");
    const displayRes = document.querySelector("#displayRes");
    const slotsText = document.querySelector("#slotsDisplay");
    slotsText.textContent = 25-count;
    console.log(count);

    /* Load modals for submit and delete buttons */
    initModals("submitModal", "bookSubmit", submitResponse, submitBooking, db, submitName, submitPhone);
    initModals("deleteModal", "deleteSubmit", deleteResponse, deleteBooking, db, deleteNo);

    /* Load booking table in Page 2 */
    buildTable(db, tbodyRef, theadRef);

    var bookSubmitBtn = document.querySelector("#bookSubmit")
    var deleteSubmitBtn = document.querySelector("#deleteSubmit")
    bookSubmitBtn.addEventListener("click", function() {
        slotsText.textContent = 25-count;
    });
    deleteSubmitBtn.addEventListener("click", function() {
        slotsText.textContent = 25-count;
    })

    //deleteSubmitBtn.addEventListener("click", updateSlotNo);

    displayRes.addEventListener("click", function(){
        //console.log(tbodyRef)
        //table is refreshed whenever user clicks to page 2
        for (i=0; i<tbodyRef.rows.length; i++) {
            //console.log(tbodyRef.rows[i].cells[j].innerHTML)
            tbodyRef.rows[i].cells[1].innerHTML = db[i+1]["serialNo"]
            tbodyRef.rows[i].cells[2].innerHTML = db[i+1]["name"]
            tbodyRef.rows[i].cells[3].innerHTML = db[i+1]["phoneNo"]
            tbodyRef.rows[i].cells[4].innerHTML = db[i+1]["timeStamp"]
        }
        //console.log(tbodyRef)
    });
        //updateTable(db, tableRef)
}); 

/* Functions to initialise modals for submit and delete buttons */
function initModals(modalID, buttonID, response, fn, db, ...number) {
    console.log("initModals")
    // Get the button that opens the modal
    var btn = document.getElementById(buttonID);

    // Get the modal
    var modal = document.getElementById(modalID);

    // Get the <span> element that closes the modal
    var span = modal.querySelector(".close");

    // When the user clicks on the button, open the modal
    btn.addEventListener("click", function() {
        modal.style.display = "block";
        displayContent = fn(db=db, ...number);
        response.textContent = displayContent
    });

    // When the user clicks on <span> (x), close the modal
    span.addEventListener("click", function() {
        modal.style.display = "none";
        const formList = document.getElementsByClassName("form");
        for (i=0; i<formList.length; i++) {
            formList[i].value=null;
        }
    });
    
    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", function(event) {
        if (event.target == modal) {
        modal.style.display = "none";
        const formList = document.getElementsByClassName("form");
        for (i=0; i<formList.length; i++) {
            formList[i].value=null;
        }
        };
    });
};

function submitBooking(db, submitName, submitPhone) {
    var submitNameValue = String(submitName.value);
    var submitPhoneValue = String(submitPhone.value);
    /* Regex and Null check */
    if (submitNameValue == "" || submitPhoneValue == "") {
        submitResponse.value = `One or more submission field is empty.`
        return submitResponse.value;
    }

    var phoneNoCheck = /^\d{8}$/;
    console.log(submitPhoneValue)
    if (!submitPhoneValue.match(phoneNoCheck)) {
        submitResponse.value = `${submitPhoneValue} is not a valid 8-digit phone number.`
        return submitResponse.value; 
    }

    /* If Phone No exists in database, display warning to user */
    var isSubmitNoFound = false;
    for (const [key, value] of Object.entries(db)) {
        if (db[key]["phoneNo"] == submitPhoneValue) {
            isSubmitNoFound = true;
        };
    };

    if (isSubmitNoFound) {
        submitResponse.value = `Phone Number ${submitPhoneValue} already exists. Unable to book for ${submitNameValue}.`;
    /* If seats are full, display warning to user */
    // Define Max Limit Here
    } else if (count >= 25) {
        console.log("checkCounter", count)
        submitResponse.value = `No seats left. Unable to book for ${submitNameValue}.`
    } else {
        submitResponse.value = createBooking(db, submitNameValue, submitPhoneValue)
        console.log(`submitBooking0: created for ${submitName.value}`)
    };
    return submitResponse.value;
};

function createBooking(db, submitNameValue, submitPhoneValue) {
    console.log(db)
    for (const [key, value] of Object.entries(db)) {
        if (db[key]["serialNo"] == null) {
            db[key]["serialNo"] = serialNo;
            db[key]["name"] = submitNameValue;
            db[key]["phoneNo"] = submitPhoneValue;
            db[key]["timeStamp"] = new Date().toLocaleString();
            count += 1;
            serialNo += 1;
            resp = `Successfully booked Seat ${key} for ${submitNameValue}. Serial No is ${serialNo}.`;
            console.log(`createBooking1: created for ${submitNameValue}`);
            return resp;
        }   
    }
}

function deleteBooking(db, deleteNo) {
    var deleteNoValue = String(deleteNo.value)
    // Regex check for digit
    var regex = /^[0-9]*$/;
    if (!deleteNoValue.match(regex)) {
        deleteResponse.value = `You have entered an invalid Registration No. Please enter digit(s).`
        return deleteResponse.value;
    }

    var isDeleteNoFound = false
    for (const [key, value] of Object.entries(db)) {
        if (db[key]["serialNo"] == deleteNoValue) {
            db[key]["serialNo"] = null;
            db[key]["name"] = null;
            db[key]["phoneNo"] = null;
            db[key]["timeStamp"] = null;
            isDeleteNoFound = true;
            count -= 1;
            deleteResponse.value = `Booking for Serial No ${deleteNoValue} has been deleted.`
            return deleteResponse.value;            
        }
    } 

    if (!isDeleteNoFound) {
        deleteResponse.value = `Serial No ${deleteNoValue} is invalid.`;
        console.log(deleteResponse.value);
        return deleteResponse.value;
    }
}

// Construct table head and body
function buildTable(db, tbodyRef, theadRef) {
    var newRow = theadRef.insertRow()
    var cell = newRow.insertCell();
    var cellText = document.createTextNode("Seat No")
    cell.appendChild(cellText)

    cell = newRow.insertCell();
    cellText = document.createTextNode("Serial No")
    cell.appendChild(cellText)

    cell = newRow.insertCell();
    cellText = document.createTextNode("Name")
    cell.appendChild(cellText)

    cell = newRow.insertCell();
    cellText = document.createTextNode("Phone No")
    cell.appendChild(cellText)

    cell = newRow.insertCell();
    cellText = document.createTextNode("Time Stamp")
    cell.appendChild(cellText)

    for (const [key,value] of Object.entries(db)) {
        var newRow = tbodyRef.insertRow();
        var seatCell = newRow.insertCell();
        var seatCellText = document.createTextNode(key);
        seatCell.appendChild(seatCellText);
        var isEmpty = false;
        for (const [_,v] in Object.entries(value)) {
            seatCell = newRow.insertCell();
            if (v == null && !isEmpty) {
                seatCellText = document.createTextNode("Null")
                seatCell.appendChild(seatCellText);
                isEmpty = true;
            } else if (isEmpty) {
                seatCellText = document.createTextNode("")
                seatCell.appendChild(seatCellText);                
            } else {
                seatCellText = document.createTextNode(v);
                seatCell.appendChild(seatCellText);
            }
        }
    }
}

function updateTable(db, tableRef) {
    console.log(tableRef.innerHTML.rows)
}

function loadDB() {
    /* 
    DB Structure:
        Dictionary
        Key = Seat No
        Value = Dictionary of {
            Serial: ,
            Name: ,
            Phone Number: ,
            Time Stamp: ,
        }
        
    */
    var db = Object();
    for (i=0; i<25; i++) {
        db[i+1] = Object({
            "serialNo": null,
            "name": null,
            "phoneNo": null,
            "timeStamp": null,    
        });
    };
    return db;
}
