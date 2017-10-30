// Simple XSJS CRUD template
// (Template is not 100% functional without making adjustments, USE AT OWN DISCRETION)
// Author: Mark Fong (YeeChen Fong, YFF865)

// SELECT data from table 
function getDataFromTable() {
    var parameterName = $.request.parameters.get('insert_parameter_here'); // Get the parameters from HTTP GET
    var conn = $.db.getConnection(); // SQL Connection
    var pstmt; // Prepare statement
    var rs; // SQL Query results
    var query; // SQL Query statement
    var output = {  // Output object
        results: [] // Result array
    };
    var record = {}; // Record object
    try {
        // # might remove hard-coded schema name, and table name
        query = 'SELECT attribute_id, attribute_name, attribute_country FROM \"schema_name\".\"table_name\" WHERE attribute_name = ?';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, parameterName);
        rs = pstmt.executeQuery(); // Execute query; Get items from SAP HANA

        // Push fetched data to Result array
        while (rs.next()) {
            record = {};
            record.parameterID = rs.getString(1);
            record.parameterName = rs.getString(2);
            record.parameterCountry = rs.getString(3);
            output.results.push(record);
        }

        conn.commit(); // Prevent deadlock by allowing a cocurrent SQL query to wait until this statement is fully executed
        rs.close(); // Close statements & connections
        pstmt.close();
        conn.close();
    } catch (e) {
        // Catch error if parameters are incorrect
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }
    // Output respond into JSON body
    var body = JSON.stringify(output);
    $.response.contentType = 'application/json';
    $.response.setBody(body);
    $.response.status = $.net.http.OK;
}

// INSERT data to table 
function insertDataToTable() {
    // Get the parameters from HTTP GET
    var parameterID = $.request.parameters.get('id');
    var parameterName = $.request.parameters.get('name');
    var parameterCountry = $.request.parameters.get('country');

    var conn = $.db.getConnection(); // SQL Connection
    var pstmt; // Prepare statement
    var rs; // SQL Query results
    var query; // SQL Query statement
    var output = {  // Output object
        results: [] // Result array
    };
    var record = {}; // Record object
    try {
        // # might remove hard-coded schema name, and table name
        // conn.prepareStatement('SET SCHEMA \"YFF865\"').execute();
        query = 'INSERT INTO \"schema_name\".\"table_name\" values(?,?,?)';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, parameterID);
        pstmt.setString(2, parameterName);
        pstmt.setString(3, parameterCountry);
        rs = pstmt.executeQuery(); // Execute query; Insert items into SAP HANA

        // Push the new inputs to Result array
        record = {};
        record.parameterID = parameterID;
        record.parameterName = parameterName;
        record.parameterCountry = parameterCountry;
        output.results.push(record);

        conn.commit(); // Prevent deadlock by allowing a cocurrent SQL query to wait until this statement is fully executed
        rs.close(); // Close statements & connections
        pstmt.close();
        conn.close();
    } catch (e) {
        // Catch error if parameters are incorrect
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }
    // Output respond into JSON body
    var body = JSON.stringify(output);
    $.response.contentType = 'application/json';
    $.response.setBody(body);
    $.response.status = $.net.http.OK;
}

// UPDATE data to table 
function updateDataToTable() {
    // Get the parameters from HTTP GET
    var parameterID = $.request.parameters.get('id');
    var parameterName = $.request.parameters.get('name');
    var parameterCountry = $.request.parameters.get('country');

    var conn = $.db.getConnection(); // SQL Connection
    var pstmt; // Prepare statement
    var rs; // SQL Query results
    var query; // SQL Query statement
    var output = {  // Output object
        results: [] // Result array
    };
    var record = {}; // Record object
    try {
        // # might remove hard-coded schema name, and table name
        // conn.prepareStatement('SET SCHEMA \"YFF865\"').execute();
        query = 'UPDATE \"schema_name\".\"table_name\" SET attribute_name = ?, attribute_country = ? WHERE attribute_id = ?';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, parameterID);
        pstmt.setString(2, parameterName);
        pstmt.setString(3, parameterCountry);
        rs = pstmt.executeQuery(); // Execute query; Update items into SAP HANA

        // Push the updated inputs to Result array
        record = {};
        record.parameterID = parameterID;
        record.parameterName = parameterName;
        record.parameterCountry = parameterCountry;
        output.results.push(record);

        conn.commit(); // Prevent deadlock by allowing a cocurrent SQL query to wait until this statement is fully executed
        rs.close(); // Close statements & connections
        pstmt.close();
        conn.close();
    } catch (e) {
        // Catch error if parameters are incorrect
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }
    // Output respond into JSON body
    var body = JSON.stringify(output);
    $.response.contentType = 'application/json';
    $.response.setBody(body);
    $.response.status = $.net.http.OK;
}

// DELETE data from table 
function deleteDataFromTable() {
    var parameterName = $.request.parameters.get('insert_parameter_here'); // Get the parameters from HTTP GET
    var conn = $.db.getConnection(); // SQL Connection
    var pstmt; // Prepare statement
    var rs; // SQL Query results
    var query; // SQL Query statement
    var output = {  // Output object
        results: [] // Result array
    };
    var record = {}; // Record object
    try {
        // # might remove hard-coded schema name, and table name
        query = 'DELETE FROM \"schema_name\".\"table_name\" WHERE attribute_name = ?';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, parameterName);
        rs = pstmt.executeQuery(); // Execute query; Delete items from SAP HANA

        // Push the deleted inputs to Result array
        record = {};
        record.deleted = parameterName;
        output.results.push(record);

        conn.commit(); // Prevent deadlock by allowing a cocurrent SQL query to wait until this statement is fully executed
        rs.close(); // Close statements & connections
        pstmt.close();
        conn.close();
    } catch (e) {
        // Catch error if parameters are incorrect
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }
    // Output respond into JSON body
    var body = JSON.stringify(output);
    $.response.contentType = 'application/json';
    $.response.setBody(body);
    $.response.status = $.net.http.OK;
}

// Switch case to determine which CRUD (CREATE,READ,UPDATE,DELETE) Operation to use; INSERT, SELECT, UPDATE, DELETE
var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
    case "select":
        getDataFromTable();
        break;

    case "insert":
        insertDataToTable();
        break;

    case "update":
        updateDataToTable();
        break;

    case "delete":
        deleteDataFromTable();
        break;

    default:
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody('Invalid Command: ', aCmd);
}