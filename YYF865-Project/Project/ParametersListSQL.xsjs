// Author: Mark Fong (YeeChen Fong, YFF865) @ YFF865 schema

// INSERT data to Y_Table
function insertDataToYTable() {
    // Get the parameters from HTTP GET
    var lastID = "0";
    var BASE_PRI_ZIAM_MCA_NBE = $.request.parameters.get('BASE_PRI_ZIAM_MCA_NBE').toString();
    var BASE_PRI_ZIAM_NSA_NCL = $.request.parameters.get('BASE_PRI_ZIAM_NSA_NCL').toString();
    var BASE_PRI_ZCLM_ZYAS = $.request.parameters.get('BASE_PRI_ZCLM_ZYAS').toString();
    var BASE_PRI_ZIAM_AGE_NCL = $.request.parameters.get('BASE_PRI_ZIAM_AGE_NCL').toString();
    var BASE_PRI_ZIAM_DSP_NCL = $.request.parameters.get('BASE_PRI_ZIAM_DSP_NCL').toString();
    var BASE_PRI_ZIAM_PPL_NCL = $.request.parameters.get('BASE_PRI_ZIAM_PPL_NCL').toString();
    var BASE_PRI_ZIAM_CCF_NCL = $.request.parameters.get('BASE_PRI_ZIAM_CCF_NCL').toString();

    var AVG_PRIORITY_ZIAM_MCA_NBE = $.request.parameters.get('AVG_PRIORITY_ZIAM_MCA_NBE').toString();
    var AVG_PRIORITY_ZIAM_NSA_NCL = $.request.parameters.get('AVG_PRIORITY_ZIAM_NSA_NCL').toString();
    var AVG_PRIORITY_ZCLM_ZYAS = $.request.parameters.get('AVG_PRIORITY_ZCLM_ZYAS').toString();
    var AVG_PRIORITY_ZIAM_AGE_NCL = $.request.parameters.get('AVG_PRIORITY_ZIAM_AGE_NCL').toString();
    var AVG_PRIORITY_ZIAM_DSP_NCL = $.request.parameters.get('AVG_PRIORITY_ZIAM_DSP_NCL').toString();
    var AVG_PRIORITY_ZIAM_PPL_NCL = $.request.parameters.get('AVG_PRIORITY_ZIAM_PPL_NCL').toString();
    var AVG_PRIORITY_ZIAM_CCF_NCL = $.request.parameters.get('AVG_PRIORITY_ZIAM_CCF_NCL').toString();

    var STDDEV_PRI_ZIAM_MCA_NBE = $.request.parameters.get('STDDEV_PRI_ZIAM_MCA_NBE').toString();
    var STDDEV_PRI_ZIAM_NSA_NCL = $.request.parameters.get('STDDEV_PRI_ZIAM_NSA_NCL').toString();
    var STDDEV_PRI_ZCLM_ZYAS = $.request.parameters.get('STDDEV_PRI_ZCLM_ZYAS').toString();
    var STDDEV_PRI_ZIAM_AGE_NCL = $.request.parameters.get('STDDEV_PRI_ZIAM_AGE_NCL').toString();
    var STDDEV_PRI_ZIAM_DSP_NCL = $.request.parameters.get('STDDEV_PRI_ZIAM_DSP_NCL').toString();
    var STDDEV_PRI_ZIAM_PPL_NCL = $.request.parameters.get('STDDEV_PRI_ZIAM_PPL_NCL').toString();
    var STDDEV_PRI_ZIAM_CCF_NCL = $.request.parameters.get('STDDEV_PRI_ZIAM_CCF_NCL').toString();

    var conn = $.db.getConnection(); // SQL Connection
    var procConn = $.hdb.getConnection(); // SAP HANA Procedure Connection
    var pstmt; // Prepare statement
    var rs; // SQL Query results
    var query; // SQL Query statement
    var output = {  // Output object
        results: [] // Result array
    };
    var record = {}; // Record object
    var runProc; // SAP HANA Procedure statement

    try {
        // Get Y_Table Latest ID
        query = 'SELECT \"ID\" from \"BLR131\".\"Y_TABLE\" ORDER BY \"ID\" DESC LIMIT 1';
        pstmt = conn.prepareStatement(query);
        rs = pstmt.executeQuery(); // Execute query; Get the Last ID of the table

        // Push fetched data to Result array
        while (rs.next()) {
            lastID = parseInt(rs.getString(1), 10) + 1;
        }

        // Create new insert query into Y_Table
        query = 'INSERT INTO \"BLR131\".\"Y_TABLE\" (\"ID\", ' +
            '\"BASE_PRI_ZIAM_MCA_NBE\", \"BASE_PRI_ZIAM_NSA_NCL\", \"BASE_PRI_ZCLM_ZYAS\", \"BASE_PRI_ZIAM_AGE_NCL\", ' +
            '\"BASE_PRI_ZIAM_DSP_NCL\", \"BASE_PRI_ZIAM_PPL_NCL\", \"BASE_PRI_ZIAM_CCF_NCL\", ' +
            '\"AVG_PRIORITY_ZIAM_MCA_NBE\", \"AVG_PRIORITY_ZIAM_NSA_NCL\", \"AVG_PRIORITY_ZCLM_ZYAS\", \"AVG_PRIORITY_ZIAM_AGE_NCL\", ' +
            '\"AVG_PRIORITY_ZIAM_DSP_NCL\",	\"AVG_PRIORITY_ZIAM_PPL_NCL\", \"AVG_PRIORITY_ZIAM_CCF_NCL\", ' +
            '\"STDDEV_PRI_ZIAM_MCA_NBE\", \"STDDEV_PRI_ZIAM_NSA_NCL\", \"STDDEV_PRI_ZCLM_ZYAS\", \"STDDEV_PRI_ZIAM_AGE_NCL\", ' +
            '\"STDDEV_PRI_ZIAM_DSP_NCL\", \"STDDEV_PRI_ZIAM_PPL_NCL\", \"STDDEV_PRI_ZIAM_CCF_NCL\"' +
            ')' + 'values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, lastID.toString());

        pstmt.setString(2, BASE_PRI_ZIAM_MCA_NBE);
        pstmt.setString(3, BASE_PRI_ZIAM_NSA_NCL);
        pstmt.setString(4, BASE_PRI_ZCLM_ZYAS);
        pstmt.setString(5, BASE_PRI_ZIAM_AGE_NCL);
        pstmt.setString(6, BASE_PRI_ZIAM_DSP_NCL);
        pstmt.setString(7, BASE_PRI_ZIAM_PPL_NCL);
        pstmt.setString(8, BASE_PRI_ZIAM_CCF_NCL);

        pstmt.setString(9, AVG_PRIORITY_ZIAM_MCA_NBE);
        pstmt.setString(10, AVG_PRIORITY_ZIAM_NSA_NCL);
        pstmt.setString(11, AVG_PRIORITY_ZCLM_ZYAS);
        pstmt.setString(12, AVG_PRIORITY_ZIAM_AGE_NCL);
        pstmt.setString(13, AVG_PRIORITY_ZIAM_DSP_NCL);
        pstmt.setString(14, AVG_PRIORITY_ZIAM_PPL_NCL);
        pstmt.setString(15, AVG_PRIORITY_ZIAM_CCF_NCL);

        pstmt.setString(16, STDDEV_PRI_ZIAM_MCA_NBE);
        pstmt.setString(17, STDDEV_PRI_ZIAM_NSA_NCL);
        pstmt.setString(18, STDDEV_PRI_ZCLM_ZYAS);
        pstmt.setString(19, STDDEV_PRI_ZIAM_AGE_NCL);
        pstmt.setString(20, STDDEV_PRI_ZIAM_DSP_NCL);
        pstmt.setString(21, STDDEV_PRI_ZIAM_PPL_NCL);
        pstmt.setString(22, STDDEV_PRI_ZIAM_CCF_NCL);
        rs = pstmt.executeQuery(); // Execute query; Insert items into SAP HANA

        // STANDARD CALL PROCEDURE
        // From Tom
        // var connection = $.hdb.getConnection();
        // var sProcedureName = "path.path.path::PROCEDURE_NAME";
        // var theProcedure = connection.loadProcedure("SCHEMA_HERE", sProcedureName);
        // var oData = theProcedure("procedure parameter (if you have one)");

        // HANA Procedure in a statement*
        // query = 'CALL \"BLR131\".PAL_NN_PREDICT(PAL_PREDICT_NN_DATA_TBL, PAL_REGRESSION_NN_MODEL_TBL,
        // \"#PAL_CONTROL_TBL\", PAL_PREDICT_NN_RESULT_TBL) WITH OVERVIEW';
        // var test2 = procConn.executeUpdate(query);
        
        // $.response.contentType = 'application/json';
        // $.response.setBody(JSON.stringify(test));
        // $.response.status = $.net.http.OK;
        // return;
        
        // runProc = procConn.executeQuery(query);
        // runProc = pstmt.execute(); // Execute query; Call PAL Procedure

        // Push the new inputs to Result array
        record = {};
        record.BASE_PRI_ZIAM_MCA_NBE = BASE_PRI_ZIAM_MCA_NBE;
        record.BASE_PRI_ZIAM_NSA_NCL = BASE_PRI_ZIAM_NSA_NCL;
        record.BASE_PRI_ZCLM_ZYAS = BASE_PRI_ZCLM_ZYAS;
        record.BASE_PRI_ZIAM_AGE_NCL = BASE_PRI_ZIAM_AGE_NCL;
        record.BASE_PRI_ZIAM_DSP_NCL = BASE_PRI_ZIAM_DSP_NCL;
        record.BASE_PRI_ZIAM_PPL_NCL = BASE_PRI_ZIAM_PPL_NCL;
        record.BASE_PRI_ZIAM_CCF_NCL = BASE_PRI_ZIAM_CCF_NCL;

        record.AVG_PRIORITY_ZIAM_MCA_NBE = AVG_PRIORITY_ZIAM_MCA_NBE;
        record.AVG_PRIORITY_ZIAM_NSA_NCL = AVG_PRIORITY_ZIAM_NSA_NCL;
        record.AVG_PRIORITY_ZCLM_ZYAS = AVG_PRIORITY_ZCLM_ZYAS;
        record.AVG_PRIORITY_ZIAM_AGE_NCL = AVG_PRIORITY_ZIAM_AGE_NCL;
        record.AVG_PRIORITY_ZIAM_DSP_NCL = AVG_PRIORITY_ZIAM_DSP_NCL;
        record.AVG_PRIORITY_ZIAM_PPL_NCL = AVG_PRIORITY_ZIAM_PPL_NCL;
        record.AVG_PRIORITY_ZIAM_CCF_NCL = AVG_PRIORITY_ZIAM_CCF_NCL;

        record.STDDEV_PRI_ZIAM_MCA_NBE = STDDEV_PRI_ZIAM_MCA_NBE;
        record.STDDEV_PRI_ZIAM_NSA_NCL = STDDEV_PRI_ZIAM_NSA_NCL;
        record.STDDEV_PRI_ZCLM_ZYAS = STDDEV_PRI_ZCLM_ZYAS;
        record.STDDEV_PRI_ZIAM_AGE_NCL = STDDEV_PRI_ZIAM_AGE_NCL;
        record.STDDEV_PRI_ZIAM_DSP_NCL = STDDEV_PRI_ZIAM_DSP_NCL;
        record.STDDEV_PRI_ZIAM_PPL_NCL = STDDEV_PRI_ZIAM_PPL_NCL;
        record.STDDEV_PRI_ZIAM_CCF_NCL = STDDEV_PRI_ZIAM_CCF_NCL;

        output.results.push(record);

        conn.commit(); // Prevent deadlock by allowing a concurrent SQL query to wait until this statement is fully executed
        rs.close(); // Close statements & connections
        // runProc.close();
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
    case "insertYTable":
        insertDataToYTable();
        break;

    default:
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody('Invalid Command: ', aCmd);
}