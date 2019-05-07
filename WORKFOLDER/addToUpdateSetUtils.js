addToUpdateSetUtils.prototype = {
    initialize: function() {
        this.updateSetAPI = new GlideUpdateSet();
        this.clientSession = gs.getSession();
    },

    addToUpdateSet: function(tableRec) {
        // Capture current update set and additional update sets used
        var currentSetID = this.updateSetAPI.get();
        if (gs.nil(this.clientSession.getClientData("originalSet"))) {
            this.clientSession.putClientData("originalSet", currentSetID);
        }
        if (gs.nil(this.clientSession.getClientData("setsUtilized"))) {
            this.clientSession.putClientData("setsUtilized", "");
        }

        // Check for table specific scripts and add item to update set
        var tableName = tableRec.getTableName();
        this.checkTable(tableRec, tableName);

        // Set user's update set back to the original
        var originalSet = this.clientSession.getClientData("originalSet");
        if (!gs.nil(originalSet)) {
            this.updateSetAPI.set(originalSet);
            this.clientSession.clearClientData("originalSet");
        }

        // Alert user of update sets utilized
        var setsUtilized = this.clientSession.getClientData("setsUtilized") + "";
        if (!gs.nil(setsUtilized)) {
            // Flush any messages from view
            gs.flushMessages();

            // Loop through all the update sets to provide info message and update parent if applicable
            var updateSet = new GlideRecord("sys_update_set");
            updateSet.addQuery("sys_id", "IN", setsUtilized);
            updateSet.query();
            while (updateSet.next()) {
                var updateSetID = updateSet.getValue("sys_id");
                var updateSetName = updateSet.getValue("name");
                var updateSetScope = updateSet.application.getDisplayValue();

                if (updateSetName.indexOf("Batch Parent") &gt; -1) {
                    gs.addErrorMessage('Update Set Batch Used &lt;a href="sys_update_set.do?sys_id=' + updateSetID + '"&gt;' + updateSetName + ' - ' + updateSetScope + '&lt;/a&gt;.');
                } else {
                    gs.addInfoMessage('Record(s) added to update set &lt;a href="sys_update_set.do?sys_id=' + updateSetID + '"&gt;' + updateSetName + ' - ' + updateSetScope + '&lt;/a&gt;.');
                }
            }

            this.clientSession.clearClientData("setsUtilized");
        }
    },

    checkTable: function(tableRec, tableName) {
        /*
         * By default the scope specific scripts are executed first and then the global checkTable function is executed
         * If you want to stop the global checkTable function from executing for a particular table, edit the scope scripts and set answer to false.
         * Example:
        	 case "sn_hr_core_service":
        		answer = false;
        		this._addHRService(recID, tableName);
        		break;
         */
        var continueProcessing = this._executeScopeScript(tableRec, tableName);
        if (continueProcessing) {
            /*
             * Below specific tables can be called out however the next switch statement below allows you to use parent tables.
             * Example is with record producers which extend sc_cat_item and the components are the same.
             * If you want to not process parent tables, set processParentTable to false similar to example above.
             */

            var processParentTable = true;
            switch (tableName) {
                case "sys_attachment":
                    this._addAttachment(tableRec, tableName);
                    break;
                case "sys_user":
                    this._addUser(tableRec, tableName);
                    break;
                case "sys_portal_page":
                    this._addPortalPage(tableRec, tableName);
                    break;
                case "pa_dashboards":
                    this._addPADashboard(tableRec, tableName);
                    break;
                case "asmt_metric_type":
                    this._addAssessment(tableRec, tableName);
                    break;
                case "sp_portal":
                    this._addSPPortal(tableRec, tableName);
                    break;
                case "sp_page":
                    this._addSPPage(tableRec, tableName);
                    break;
                case "sp_widget":
                    this._addSPWidget(tableRec, tableName);
                    break;
                case "sys_cs_topic":
                    this._addVirtualAgent(tableRec, tableName);
                    break;
                case "sys_cb_topic":
                    this._addVirtualAgent(tableRec, tableName);
                    break;
                case "sys_db_object":
                    this._addDbObject(tableRec, tableName);
                    break;
                case "sys_dictionary":
                    this._addField(tableRec, tableName);
                    break;
                case "wf_workflow":
                    this._addWorkflow(tableRec, tableName);
                    break;
                case "item_option_new_set":
                    this._addVariableSet(tableRec, tableName);
                    break;
                default:
                    this.saveRecord(tableRec);
                    break;
            }

            if (processParentTable) {
                // Check for table needs at parent table level
                var tableBase = this._getTableBase(tableName);
                switch (tableBase) {
                    case "sc_cat_item":
                        this._addCatItem(tableRec, tableName);
                        break;
                    case "kb_knowledge":
                        this._addKnowledge(tableRec, tableName);
                        break;
                }
            }
        }
    },

    _getTableBase: function(tableName) {
        return new global.TableUtils(tableName).getAbsoluteBase() + "";
    },

    saveRecord: function(tableRec) {
        if (!tableRec.isValidRecord()) {
            return;
        }

        this._checkSetScope(tableRec);

        var updateManager = new GlideUpdateManager2();
        updateManager.saveRecord(tableRec);

        //Add any attachments to the update set
        this._addAttachments(tableRec);

        //Add any translations to the update set
        this._addTranslations(tableRec);
    },

    _executeScopeScript: function(tableRec, tableName) {
        var answer = "";

        var scopeName = "global";

        if (tableRec.isValidField("sys_scope")) {
            scopeName = tableRec.sys_scope.scope;
        } else if (!gs.nil(tableRec.sys_meta) &amp;&amp; !gs.nil(tableRec.sys_meta.sys_scope)) {
            scopeName = tableRec.sys_meta.sys_scope.toString();
            var storeApp = new GlideRecord("sys_store_app");
            if (storeApp.get(scopeName)) {
                scopeName = storeApp.getValue("scope");
            }
        }

        if (scopeName == "global") {
            // Return true so table processing continues
            answer = true;
        } else {
            var scriptInclude = new GlideRecord("sys_script_include");
            scriptInclude.addQuery("api_name", scopeName + ".addToUpdateSetUtils");
            scriptInclude.query();
            if (scriptInclude.next()) {
                var scriptName = "new " + scopeName + ".addToUpdateSetUtils().checkTable('" + tableRec.getValue("sys_id") + "','" + tableName + "')";
                answer = GlideEvaluator.evaluateString(scriptName);
            } else {
                // No scope script include exists, return true so global processing continues
                answer = true;
            }
        }

        return answer;
    },

    _checkSetScope: function(tableRec) {
        var currentSetID = this.updateSetAPI.get();
        var setsUtilized = this.clientSession.getClientData("setsUtilized") + "";
        setsUtilized = setsUtilized.split(",");

        var currentSet = new GlideRecord("sys_update_set");
        currentSet.get(currentSetID);
        var currentSetName = currentSet.getValue("name");
        var currentSetScope = currentSet.getValue("application");
        var parentUpdateSetID = currentSet.getValue("parent");

        var tableRecScope = "global";
        if (tableRec.isValidField("sys_scope") &amp;&amp; !gs.nil(tableRec.getValue("sys_scope"))) {
            tableRecScope = tableRec.getValue("sys_scope");
        }

        var updateSet = new GlideRecord("sys_update_set");
        if (tableRecScope != currentSetScope) {
            var createParentSet = false;
            var createChildSet = false;
            if (!gs.nil(parentUpdateSetID)) {
                updateSet.initialize();
                updateSet.addQuery("parent", parentUpdateSetID);
                updateSet.addQuery("application", tableRecScope);
                updateSet.query();
                if (updateSet.next()) {
                    currentSetID = updateSet.getValue("sys_id");
                } else {
                    createChildSet = true;
                    createParentSet = false;
                }
            } else {
                createChildSet = true;
                createParentSet = true;
            }

            if (createChildSet) {
                if (createParentSet) {
                    // Create parent set
                    updateSet.initialize();
                    updateSet.get(currentSetID);
                    updateSet.name = updateSet.getValue("name") + " - Batch Parent";
                    parentUpdateSetID = updateSet.insert();

                    if (currentSetName.indexOf("- Batch Child") == -1) {
                        currentSet.name = currentSetName + " - Batch Child";
                    }
                    currentSet.parent = parentUpdateSetID;
                    currentSet.update();
                }

                currentSet.application = tableRecScope;
                currentSetID = currentSet.insert();
            }
        } else if (currentSet.getValue("base_update_set") == currentSet.getValue("sys_id")) {
            // Prevent updates from being added to the batch parent update set
            updateSet.initialize();
            updateSet.addQuery("parent", currentSet.getValue("sys_id"));
            updateSet.addQuery("application", currentSetScope);
            updateSet.query();
            if (updateSet.next()) {
                currentSetID = updateSet.getValue("sys_id");
            }
        }
        this.updateSetAPI.set(currentSetID);

        if (setsUtilized.indexOf(currentSetID) == -1) {
            setsUtilized.push(currentSetID);
        }
        if (!gs.nil(parentUpdateSetID) &amp;&amp; setsUtilized.indexOf(parentUpdateSetID) == -1) {
            // Insert at front spot
            setsUtilized.unshift(parentUpdateSetID);
        }
        this.clientSession.putClientData("setsUtilized", setsUtilized.toString());
    },

    /********************* Table Specific Functions *********************/

    /********************* Begin Attachment Functions *********************/
    //Add an attachment to the update set
    _addAttachment: function(tableRec, tableName) {
        this.saveRecord(tableRec);
        this._addAttachmentDocs(tableRec, tableName);
    },

    //Add all record attachments to the update set
    _addAttachments: function(tableRec, tableName) {
        //If the current record *has* attachments, add those
        if (gs.nil(tableName)) {
            tableName = tableRec.getTableName();
        }

        if (tableRec.hasAttachments()) {
            //Process the main sys_attachment record
            var attach = new GlideRecord("sys_attachment");
            attach.addQuery("table_name", tableName);
            attach.addQuery("table_sys_id", tableRec.sys_id.toString());
            attach.query();
            while (attach.next()) {
                this.saveRecord(attach);

                //Process each sys_attachment_doc chunk
                this._addAttachmentDocs(attach, "sys_attachment");
            }
        }
    },

    //Add attachment chunks to the update set
    _addAttachmentDocs: function(tableRec, tableName) {
        var attach_doc = new GlideRecord("sys_attachment_doc");
        attach_doc.addQuery("sys_attachment", tableRec.sys_id.toString());
        attach_doc.orderBy("position");
        attach_doc.query();
        while (attach_doc.next()) {
            this.saveRecord(attach_doc);
        }
    },
    /********************* End Attachment Functions *********************/

    //Add record translations to the update set
    _addTranslations: function(tableRec) {
        //If the current record *has* translations, add those

        // sys_translated_text records are automatically added
        /*
        var translatedText = new GlideRecord("sys_translated_text");
        translatedText.addQuery("tablename", tableRec.getTableName());
        translatedText.addQuery("documentkey", tableRec.getValue("sys_id"));
        translatedText.query();
        while (translatedText.next()) {
        	this.saveRecord(translatedText);
        }*/

        var tableHierarchy = new global.TableUtils("item_option_new").getTables().toArray();
        // tableHierarchy isn't a real array so convert to array and remove sys_metadata
        var tableList = [];
        for (var i = 0; i &lt; tableHierarchy.length; i++) {
            var tableName = tableHierarchy[i];
            if (!tableName.startsWith("sys_")) {
                tableList.push(tableName);
            }
        }
        var fieldList = [];
        var translatedField = new GlideAggregate("sys_translated");
        translatedField.addAggregate("count");
        translatedField.addAggregate("count(distinct", "element");
        translatedField.addQuery("name", "IN", tableList);
        translatedField.query();
        while (translatedField.next()) {
            var count = translatedField.getAggregate("count");
            if (count &gt; 1) {
                fieldList.push(translatedField.element.toString());
            }
        }

        var translationList = [];
        for (var f = 0; f &lt; fieldList.length; f++) {
            var fieldName = fieldList[f];
            translationList.push(tableRec.getValue(fieldName));
        }

        translatedField = new GlideRecord("sys_translated");
        translatedField.addQuery("name", "IN", tableList.toString());
        translatedField.addQuery("element", "IN", fieldList.toString());
        translatedField.addQuery("value", "IN", translationList.toString()).addOrCondition("label", "IN", translationList.toString());
        translatedField.query();
        while (translatedField.next()) {
            this.saveRecord(translatedField);
        }
    },

    /********************* Begin KB Functions *********************/
    //Add KB Article and all dependencies to the update set
    _addKnowledge: function(tableRec, tableName) {
        this._addKnowledgeArticle(tableRec, tableName);

        var canReadList = tableRec.can_read_user_criteria.toString().split(",");
        var cannotReadList = tableRec.cannot_read_user_criteria.toString().split(",");

        var knowledgeBlockM2M = new GlideRecord("m2m_kb_to_block_history");
        knowledgeBlockM2M.addQuery("knowledge", tableRec.sys_id.toString());
        knowledgeBlockM2M.query();
        while (knowledgeBlockM2M.next()) {
            this.saveRecord(knowledgeBlockM2M);

            var knowledgeBlock = knowledgeBlockM2M.knowledge_block.getRefRecord();
            this._addKnowledgeArticle(knowledgeBlock, knowledgeBlock.getTableName());

            var userCriteriaID;
            var blockCanReadList = knowledgeBlock.can_read_user_criteria.toString().split(",");
            for (var c = 0; c &lt; blockCanReadList.length; c++) {
                userCriteriaID = blockCanReadList[c].toString();
                if (canReadList.toString().indexOf(userCriteriaID) == -1) {
                    canReadList.push(userCriteriaID);
                }
            }

            var blockCannotReadList = knowledgeBlock.cannot_read_user_criteria.toString().split(",");
            for (var n = 0; n &lt; blockCannotReadList.length; n++) {
                userCriteriaID = blockCannotReadList[n].toString();
                if (cannotReadList.toString().indexOf(userCriteriaID) == -1) {
                    cannotReadList.push(userCriteriaID);
                }
            }
        }

        var arrayUtil = new global.ArrayUtil();
        var userCriteriaList = arrayUtil.concat(canReadList, cannotReadList);
        var userCriteria = new GlideRecord("user_criteria");
        userCriteria.addQuery("sys_id", "IN", userCriteriaList.toString());
        userCriteria.query();
        while (userCriteria.next()) {
            this.saveRecord(userCriteria);
        }

        try {
            // Check for linked HR Criteria
            new sn_hr_core.addToUpdateSetUtils()._addHRCriteria("related_user_criteria", userCriteriaList.toString());
        } catch (err) {

        }
    },

    _addKnowledgeArticle: function(tableRec, tableName) {
        this._cleanKBFields(tableRec);
        this.saveRecord(tableRec);

        var kbVersion = tableRec.version.getRefRecord();
        this.saveRecord(kbVersion);

        var kbSummary = tableRec.summary.getRefRecord();
        this.saveRecord(kbSummary);

        var kbCategory = tableRec.kb_category.getRefRecord();
        this.saveRecord(kbCategory);

        this._addAttachments(tableRec, tableName);

        return tableRec;
    },

    //Sanitize KB fields
    //Not typically needed
    _cleanKBFields: function(tableRec) {
        /*var adminSysID = "6816f79cc0a8016401c5a33be04be441"; // User System Administrator's sys_id
        tableRec.base_version = "";
        tableRec.modified_by = adminSysID;
        tableRec.author = adminSysID;*/
        return tableRec;
    },
    /********************* End KB Functions *********************/

    //Add user record and dependencies to the update set
    _addUser: function(tableRec, tableName) {
        this.saveRecord(tableRec);

        var userID = tableRec.getValue("sys_id");

        var userRole = new GlideRecord("sys_user_has_role");
        userRole.addQuery("user", userID);
        userRole.addQuery("inherited", false);
        userRole.query();
        while (userRole.next()) {
            this.saveRecord(userRole);
        }

        var userGroup = new GlideRecord("sys_user_grmember");
        userGroup.addQuery("user", userID);
        userGroup.query();
        while (userGroup.next()) {
            this.saveRecord(userGroup);
        }

        var userDelegate = new GlideRecord("sys_user_delegate");
        userDelegate.addQuery("user", userID);
        userDelegate.query();
        while (userDelegate.next()) {
            this.saveRecord(userDelegate);
        }

    },

    /********************* Begin Catalog &amp; Workflow Functions *********************/
    //Add Catalog Item and all dependencies to the update set
    _addCatItem: function(tableRec, tableName) {
        var answer = [];

        this.saveRecord(tableRec);

        var catItemID = tableRec.sys_id.toString();

        var variableSetList = [];
        var variableSetM2M = new GlideRecord("io_set_item");
        variableSetM2M.addQuery("sc_cat_item", catItemID);
        variableSetM2M.query();
        while (variableSetM2M.next()) {
            this.saveRecord(variableSetM2M);
            var variableSet = variableSetM2M.variable_set.getRefRecord();
            this.saveRecord(variableSet);
            variableSetList.push(variableSet.sys_id.toString());
        }

        var variableQuery = "cat_item=" + catItemID;
        if (variableSetList.length &gt; 0) {
            variableQuery = variableQuery + "^ORvariable_setIN" + variableSetList.toString();
        }
        var variables = new GlideRecord("item_option_new");
        variables.addEncodedQuery(variableQuery);
        variables.query();
        while (variables.next()) {
            this.saveRecord(variables);
        }

        var clientScript = new GlideRecord("catalog_script_client");
        clientScript.addEncodedQuery(variableQuery);
        clientScript.query();
        while (clientScript.next()) {
            this.saveRecord(clientScript);
        }

        var uiPolicyList = [];
        var uiPolicyQuery = variableQuery.replace("cat_item=", "catalog_item=");
        var uiPolicy = new GlideRecord("catalog_ui_policy");
        uiPolicy.addEncodedQuery(uiPolicyQuery);
        uiPolicy.query();
        while (uiPolicy.next()) {
            this.saveRecord(uiPolicy);
            uiPolicyList.push(uiPolicy.sys_id.toString());
        }

        var uiPolicyAction = new GlideRecord("catalog_ui_policy_action");
        uiPolicyAction.addQuery("ui_policy", "IN", uiPolicyList.toString());
        uiPolicyAction.query();
        while (uiPolicyAction.next()) {
            this.saveRecord(uiPolicyAction);
        }

        var userCriteria;
        var availableForM2M = new GlideRecord("sc_cat_item_user_criteria_mtom");
        availableForM2M.addQuery("sc_cat_item", catItemID);
        availableForM2M.query();
        while (availableForM2M.next()) {
            this.saveRecord(availableForM2M);
            userCriteria = availableForM2M.user_criteria.getRefRecord();
            this.saveRecord(userCriteria);

            answer.push(userCriteria.sys_id.toString());
        }

        var notAvailableForM2M = new GlideRecord("sc_cat_item_user_criteria_no_mtom");
        notAvailableForM2M.addQuery("sc_cat_item", catItemID);
        notAvailableForM2M.query();
        while (notAvailableForM2M.next()) {
            this.saveRecord(notAvailableForM2M);
            userCriteria = notAvailableForM2M.user_criteria.getRefRecord();
            this.saveRecord(userCriteria);

            answer.push(userCriteria.sys_id.toString());
        }

        var itemCategory = new GlideRecord("sc_cat_item_category");
        itemCategory.addQuery("sc_cat_item", catItemID);
        itemCategory.query();
        while (itemCategory.next()) {
            this.saveRecord(itemCategory);
            var scCategory = itemCategory.sc_category.getRefRecord();
            this.saveRecord(scCategory);
        }

        var itemCatalog = new GlideRecord("sc_cat_item_catalog");
        itemCatalog.addQuery("sc_cat_item", catItemID);
        itemCatalog.query();
        while (itemCatalog.next()) {
            this.saveRecord(itemCatalog);
            var scCatalog = itemCatalog.sc_catalog.getRefRecord();
            this.saveRecord(scCatalog);
        }

        if (!gs.nil(tableRec.workflow)) {
            var itemWorkflow = tableRec.workflow.getRefRecord();
            this.saveRecord(itemWorkflow);

            var workflowVersion = new GlideRecord("wf_workflow_version");
            workflowVersion.addQuery("workflow", itemWorkflow.getValue("sys_id"));
            workflowVersion.addQuery("published", true);
            workflowVersion.query();
            while (workflowVersion.next()) {
                //Get sub-workflow instances
                var subWorkflowInstance = new GlideRecord("wf_workflow_instance");
                subWorkflowInstance.addQuery("workflow_version", workflowVersion.sys_id.toString());
                subWorkflowInstance.query();
                while (subWorkflowInstance.next()) {
                    //Get subWorkflows
                    var subWorkflow = new GlideRecord("wf_workflow");
                    subWorkflow.addQuery("sys_id", subWorkflowInstance.workflow.toString());
                    subWorkflow.query();
                    if (subWorkflow.next()) {
                        this.saveRecord(subWorkflow);
                        this._gatherChildWorkflows(subWorkflow);
                    }
                }
            }
        }

        if (tableName == "sc_cat_item_guide") {
            var orderGuideRule = new GlideRecord("sc_cat_item_guide_items");
            orderGuideRule.addQuery("guide", catItemID);
            orderGuideRule.query();
            while (orderGuideRule.next()) {
                this.saveRecord(orderGuideRule);

                // TODO recursively get cat items and child records
                var orderGuideRuleItem = orderGuideRule.item.getRefRecord();
                this.saveRecord(orderGuideRuleItem);

                var varAssignment = new GlideRecord("sc_item_variable_assignment");
                varAssignment.addQuery("rule", orderGuideRule.getValue("sys_id"));
                varAssignment.query();
                while (varAssignment.next()) {
                    this.saveRecord(varAssignment);
                }
            }
        }

        if (tableName == "pc_software_cat_item" || tableName == "pc_hardware_cat_item") {
            var vendorCatItem = new GlideRecord("pc_vendor_cat_item");
            vendorCatItem.addQuery("product_catalog_item", catItemID);
            vendorCatItem.query();
            while (vendorCatItem.next()) {
                this.saveRecord(vendorCatItem);
            }
        }

        return answer;
    },

    //Add workflow to the update set
    _addWorkflow: function(record, tableName) {
        this._gatherChildWorkflows(record);
        this.saveRecord(record);
    },

    //Recursively gather all child workflows
    _gatherChildWorkflows: function(workflow) {
        //Get published workflow version
        var workflowVersion = new GlideRecord("wf_workflow_version");
        workflowVersion.addQuery("workflow", workflow.sys_id.toString());
        workflowVersion.addQuery("published", true);
        workflowVersion.query();
        while (workflowVersion.next()) {
            //Get sub-workflow instances
            var subWorkflowInstance = new GlideRecord("wf_workflow_instance");
            subWorkflowInstance.addQuery("workflow_version", workflowVersion.sys_id.toString());
            subWorkflowInstance.query();
            while (subWorkflowInstance.next()) {
                //Get subWorkflows
                var subWorkflow = new GlideRecord("wf_workflow");
                subWorkflow.addQuery("sys_id", subWorkflowInstance.workflow.toString());
                subWorkflow.query();
                if (subWorkflow.next()) {
                    this._gatherChildWorkflows(subWorkflow);
                    this.saveRecord(subWorkflow);
                }
            }
        }
    },

    //Add variable set to the update set
    _addVariableSet: function(tableRec, tableName) {
        this._checkSetScope(tableRec);
        var variableQuery = "variable_set=" + tableRec.sys_id.toString();
        var variables = new GlideRecord("item_option_new");
        variables.addEncodedQuery(variableQuery);
        variables.query();
        while (variables.next()) {
            this.saveRecord(variables);
        }

        var clientScript = new GlideRecord("catalog_script_client");
        clientScript.addEncodedQuery(variableQuery);
        clientScript.query();
        while (clientScript.next()) {
            this.saveRecord(clientScript);
        }

        var uiPolicyList = [];
        var uiPolicy = new GlideRecord("catalog_ui_policy");
        uiPolicy.addEncodedQuery(variableQuery);
        uiPolicy.query();
        while (uiPolicy.next()) {
            this.saveRecord(uiPolicy);
            uiPolicyList.push(uiPolicy.sys_id.toString());
        }

        var uiPolicyAction = new GlideRecord("catalog_ui_policy_action");
        uiPolicyAction.addQuery("ui_policy", "IN", uiPolicyList.toString());
        uiPolicyAction.query();
        while (uiPolicyAction.next()) {
            this.saveRecord(uiPolicyAction);
        }
        this.saveRecord(tableRec);
    },
    /********************* End Catalog &amp; Workflow Functions *********************/

    //Add Homepage and all contents to the udpate set
    _addPortalPage: function(tableRec, tableName) {
        this._checkSetScope(tableRec);
        GlideappHome.unloader(tableRec);
        //Unloader should get most records, but adding redundant below for completeness
        this.saveRecord(tableRec);
        this._addSysPortalPageDependencies(tableRec,'sys_portal');
    },

    //Gather dropzones and contents for a homepage
    _addSysPortalPageDependencies: function(tableRec, tableName) {
        var grSP = new GlideRecord(tableName);
        grSP.addQuery('page',tableRec.sys_id.toString());
        grSP.query();
        while(grSP.next()){
            this.saveRecord(tableRec);
            this._addSysPortalDependencies(grSP, 'sys_portal_preferences');
        }
    },

    //Gather contents of a dropozone
    _addSysPortalDependencies: function(tableRec, tableName) {
        var grSPP = new GlideRecord(tableName);
        grSPP.addQuery('portal_section',tableRec.sys_id.toString());
        grSPP.query();
        while(grSPP.next())
            this.saveRecord(tableRec);
    },

    //Add PA Dashboard and all contents to the update set
    _addPADashboard: function(tableRec, tableName) {
        this.saveRecord(tableRec);

        var dashboardID = tableRec.getValue("sys_id");

        var dashboardTabM2M = new GlideRecord("pa_m2m_dashboard_tabs");
        dashboardTabM2M.addQuery("dashboard", dashboardID);
        dashboardTabM2M.query();
        while (dashboardTabM2M.next()) {
            var dashboardTab = dashboardTabM2M.tab.getRefRecord();
            this.saveRecord(dashboardTab);

            var portalPageID = dashboardTab.getValue("page");
            if (!gs.nil(portalPageID)) {
                var portalPage = dashboardTab.page.getRefRecord();
                this._addPortalPage(portalPage, portalPage.getTableName());
            }

            var canvasPageID = dashboardTab.getValue("canvas_page");
            if (!gs.nil(canvasPageID)) {
                var canvasPage = dashboardTab.canvas_page.getRefRecord();
                this.saveRecord(canvasPage);
                var portalPage = canvasPage.legacy_page.getRefRecord();
                this._addPortalPage(portalPage, portalPage.getTableName());
            }
        }

        var dashboardPermission = new GlideRecord("pa_dashboards_permissions");
        dashboardPermission.addQuery("dashboard", dashboardID);
        dashboardPermission.query();
        while (dashboardPermission.next()) {
            this.saveRecord(dashboardPermission);
        }
    },

    //Add assessment to the update set
    _addAssessment: function(tableRec, tableName) {
        this.saveRecord(tableRec);

        var assessmentID = tableRec.getValue("sys_id");

        var assessmentCategory = new GlideRecord("asmt_metric_category");
        assessmentCategory.addQuery("metric_type", assessmentID);
        assessmentCategory.query();
        while (assessmentCategory.next()) {
            this.saveRecord(assessmentCategory);

            var assessmentQuestion = new GlideRecord("asmt_metric");
            assessmentQuestion.addQuery("category", assessmentCategory.getValue("sys_id"));
            assessmentQuestion.query();
            while (assessmentQuestion.next()) {
                this.saveRecord(assessmentQuestion);

                var assessmentQuestionID = assessmentQuestion.getValue("sys_id");

                var assessmentTemplate = assessmentQuestion.template.getRefRecord();
                this.saveRecord(assessmentTemplate);

                var assessmentTemplateDefinition = new GlideRecord("asmt_template_definition");
                assessmentTemplateDefinition.addQuery("template", assessmentQuestionID);
                assessmentTemplateDefinition.query();
                while (assessmentTemplateDefinition.next()) {
                    this.saveRecord(assessmentTemplateDefinition);
                }

                var assessmentDefinition = new GlideRecord("asmt_metric_definition");
                assessmentDefinition.addQuery();
                assessmentDefinition.query("metric", assessmentQuestionID);
                while (assessmentDefinition.next()) {
                    this.saveRecord(assessmentDefinition);
                }
            }
        }

        var assessmentCondition = new GlideRecord("asmt_condition");
        assessmentCondition.addQuery("assessment", assessmentID);
        assessmentCondition.query();
        while (assessmentCondition.next()) {
            this.saveRecord(assessmentCondition);

            var businessRule = assessmentCondition.business_rule.getRefRecord();
            this.saveRecord(businessRule);
        }
    },

    //Add Virtual Agent to the update set
    _addVirtualAgent: function(tableRec, tableName) {
        this.saveRecord(tableRec);

        var otherTable = "";
        var queryField = "";
        var queryValue = "";
        if (tableName == "sys_cs_topic") {
            otherTable = "sys_cb_topic";
            queryField = "sys_id";
            queryValue = tableRec.getValue("cb_topic_id");
        } else {
            otherTable = "sys_cs_topic";
            queryField = "cb_topic_id";
            queryValue = tableRec.getValue("sys_id");
        }

        var agentTopic = new GlideRecord(otherTable);
        agentTopic.addQuery(queryField, queryValue);
        agentTopic.query();
        if (agentTopic.next()) {
            this.saveRecord(agentTopic);
        } else {
            agentTopic.initialize();
            agentTopic.addQuery("name", tableRec.getValue("name"));
            agentTopic.query();
            if (agentTopic.next()) {
                this.saveRecord(agentTopic);
            }
        }
    },

    /********************* Begin Service Portal Functions *********************/
    _addSPPortal: function(record, tableName) {
        this.saveRecord(record);

        var portalPage;
        //Add homepage
        if (!record.homepage.nil()) {
            portalPage = new GlideRecord("sp_page");
            if (portalPage.get(record.homepage.sys_id.toString())) {
                this.saveRecord(portalPage);
                this._addPageDependencies(portalPage);
            }
        }
        //Add KB homepage
        if (!record.kb_knowledge_page.nil()) {
            portalPage = new GlideRecord("sp_page");
            if (portalPage.get(record.kb_knowledge_page.sys_id.toString())) {
                this.saveRecord(portalPage);
                this._addPageDependencies(portalPage);
            }
        }
        //Add Login page
        if (!record.login_page.nil()) {
            portalPage = new GlideRecord("sp_page");
            if (portalPage.get(record.login_page.sys_id.toString())) {
                this.saveRecord(portalPage);
                this._addPageDependencies(portalPage);
            }
        }
        //Add 404 page
        if (!record.notfound_page.nil()) {
            portalPage = new GlideRecord("sp_page");
            if (portalPage.get(record.notfound_page.sys_id.toString())) {
                this.saveRecord(portalPage);
                this._addPageDependencies(portalPage);
            }
        }
        //Add Catalog page
        if (!record.sc_catalog_page.nil()) {
            portalPage = new GlideRecord("sp_page");
            if (portalPage.get(record.sc_catalog_page.sys_id.toString())) {
                this.saveRecord(portalPage);
                this._addPageDependencies(portalPage);
            }
        }
        //Add Main Menu
        if (!record.sp_rectangle_menu.nil()) {
            var mainMenu = new GlideRecord("sp_instance_menu");
            if (mainMenu.get(record.sp_rectangle_menu.sys_id.toString())) {
                //Add Menu rectangle items
                var menuRectangleItem = new GlideRecord("sp_rectangle_menu_item");
                menuRectangleItem.addQuery("sp_rectangle_menu", mainMenu.sys_id.toString());
                menuRectangleItem.query();
                while (menuRectangleItem.next()) {
                    this.saveRecord(menuRectangleItem);
                    this._gatherChildMenuRectangleItems(menuRectangleItem);
                }
                this.saveRecord(mainMenu);
            }
        }
        //Add Theme
        if (!record.theme.nil()) {
            var theme = new GlideRecord("sp_theme");
            if (theme.get(record.theme.sys_id.toString())) {
                //Add header &amp;amp; footer
                var headerFooter = new GlideRecord("sp_header_footer");
                headerFooter.addQuery("sys_id", theme.header.sys_id.toString()).addOrCondition("sys_id", theme.footer.sys_id.toString());
                headerFooter.query();
                while (headerFooter.next()) {
                    //Add ng-templates
                    var ngTemplate = new GlideRecord("sp_ng_template");
                    ngTemplate.addQuery("sp_widget", headerFooter.sys_id.toString());
                    ngTemplate.query();
                    while (ngTemplate.next())
                        this.saveRecord(ngTemplate);
                    this.saveRecord(headerFooter);
                }
                //Add JS Includes
                var jsIncludeM2M = new GlideRecord("m2m_sp_theme_js_include");
                jsIncludeM2M.addQuery("sp_theme", theme.sys_id.toString());
                jsIncludeM2M.query();
                while (jsIncludeM2M.next()) {
                    var jsInclude = new GlideRecord("sp_js_include");
                    if (jsInclude.get(jsIncludeM2M.sp_js_include.sys_id.toString())) {
                        //For local js includes, get ui script
                        if (jsInclude.source.toString() == 'local') {
                            var uiScript = new GlideRecord("sys_ui_script");
                            if (uiScript.get(jsInclude.sys_ui_script.sys_id.toString()))
                                this.saveRecord(uiScript);
                        }
                        this.saveRecord(jsInclude);
                    }
                    this.saveRecord(jsIncludeM2M);
                }
                //Add CSS Includes
                var cssIncludeM2M = new GlideRecord("m2m_sp_theme_css_include");
                cssIncludeM2M.addQuery("sp_theme", theme.sys_id.toString());
                cssIncludeM2M.query();
                while (cssIncludeM2M.next()) {
                    var cssInclude = new GlideRecord("sp_css_include");
                    if (cssInclude.get(cssIncludeM2M.sp_css_include.sys_id.toString())) {
                        //For local css includes, get style sheet
                        if (cssInclude.source.toString() == 'local') {
                            var styleSheet = new GlideRecord("sp_css");
                            if (styleSheet.get(cssInclude.sp_css.sys_id.toString()))
                                this.saveRecord(styleSheet);
                        }
                        this.saveRecord(cssInclude);
                    }
                    this.saveRecord(cssIncludeM2M);
                }
                this.saveRecord(theme);
            }
        }
    },

    _addSPWidget: function(record, tableName) {
        this.saveRecord(record);
        this._addWidgetDependencies(record);
    },

    _addSPPage: function(record, tableName) {
        this.saveRecord(record);
        this._addPageDependencies(record);
    },

    //Add page dependencies to the update set
    _addPageDependencies: function(record) {
        //Add containers
        var container = new GlideRecord("sp_container");
        container.addQuery("sp_page", record.sys_id.toString());
        container.query();
        while (container.next()) {
            //Add rows
            var row = new GlideRecord("sp_row");
            row.addQuery("sp_container", container.sys_id.toString());
            row.query();
            while (row.next()) {
                //add columns and column rows and widget instances
                this._gatherColumnsAndColumnRowsAndInstances(row);
                this.saveRecord(row);
            }
            this.saveRecord(container);
        }
        //Add menu rectangle items
        var menuRectangleItem = new GlideRecord("sp_rectangle_menu_item");
        menuRectangleItem.addQuery("sp_page", record.sys_id.toString());
        menuRectangleItem.query();
        while (menuRectangleItem.next()) {
            this.saveRecord(menuRectangleItem);
            this._gatherChildMenuRectangleItems(menuRectangleItem);
        }
    },

    //Add widget dependencies to the update set
    _addWidgetDependencies: function(record) {
        //Add dependencies
        var dependencyM2M = new GlideRecord("m2m_sp_widget_dependency");
        dependencyM2M.addQuery("sp_widget", record.sys_id.toString());
        dependencyM2M.query();
        while (dependencyM2M.next()) {
            var dependency = new GlideRecord("sp_dependency");
            if (dependency.get(dependencyM2M.sp_dependency.sys_id.toString())) {
                //Add JS Includes
                var jsIncludeM2M = new GlideRecord("m2m_sp_dependency_js_include");
                jsIncludeM2M.addQuery("sp_dependency", dependency.sys_id.toString());
                jsIncludeM2M.query();
                while (jsIncludeM2M.next()) {
                    var jsInclude = new GlideRecord("sp_js_include");
                    if (jsInclude.get(jsIncludeM2M.sp_js_include.sys_id.toString())) {
                        //For local js includes, get ui script
                        if (jsInclude.source.toString() == 'local') {
                            var uiScript = new GlideRecord("sys_ui_script");
                            if (uiScript.get(jsInclude.sys_ui_script.sys_id.toString()))
                                this.saveRecord(uiScript);
                        }
                        this.saveRecord(jsInclude);
                    }
                    this.saveRecord(jsIncludeM2M);
                }
                //Add CSS Includes
                var cssIncludeM2M = new GlideRecord("m2m_sp_dependency_css_include");
                cssIncludeM2M.addQuery("sp_dependency", dependency.sys_id.toString());
                cssIncludeM2M.query();
                while (cssIncludeM2M.next()) {
                    var cssInclude = new GlideRecord("sp_css_include");
                    if (cssInclude.get(cssIncludeM2M.sp_css_include.sys_id.toString())) {
                        //For local css includes, get style sheet
                        if (cssInclude.source.toString() == 'local') {
                            var styleSheet = new GlideRecord("sp_css");
                            if (styleSheet.get(cssInclude.sp_css.sys_id.toString()))
                                this.saveRecord(styleSheet);
                        }
                        this.saveRecord(cssInclude);
                    }
                    this.saveRecord(cssIncludeM2M);
                }
                this.saveRecord(dependency);
            }
            this.saveRecord(dependencyM2M);
        }
        //Add angular providers
        var providerM2M = new GlideRecord("m2m_sp_ng_pro_sp_widget");
        providerM2M.addQuery("sp_widget", record.sys_id.toString());
        providerM2M.query();
        while (providerM2M.next()) {
            var provider = new GlideRecord("sp_angular_provider");
            if (provider.get(providerM2M.sp_angular_provider.sys_id.toString())) {
                //Get required providers
                this._gatherRequiredProviders(provider);
                this.saveRecord(provider);
            }
            this.saveRecord(providerM2M);
        }
        //Add ng-templates
        var ngTemplate = new GlideRecord("sp_ng_template");
        ngTemplate.addQuery("sp_widget", record.sys_id.toString());
        ngTemplate.query();
        while (ngTemplate.next())
            this.saveRecord(ngTemplate);
        //Add embedded widgets
        var widgetHTML = record.template.toString();
        var regExp = new RegExp('&amp;lt;sp-widget.*id=["\'](.*)["\']', 'g');
        var widgetId = regExp.exec(widgetHTML);
        while (widgetId) {
            var embeddedWidget = new GlideRecord("sp_widget");
            embeddedWidget.addQuery("id", widgetId[1]);
            embeddedWidget.query();
            if (embeddedWidget.next()) {
                this.saveRecord(embeddedWidget);
                this._addWidgetDependencies(embeddedWidget);
            }
            widgetId = regExp.exec(widgetHTML);
        }
    },

    //Recursively gather all required angular providers
    _gatherRequiredProviders: function(provider) {
        var requiredProviderM2M = new GlideRecord("m2m_sp_ng_pro_sp_ng_pro");
        requiredProviderM2M.addQuery("required_by", provider.sys_id.toString());
        requiredProviderM2M.query();
        while (requiredProviderM2M.next()) {
            var requiredProvider = new GlideRecord("sp_angular_provider");
            if (requiredProvider.get(requiredProviderM2M.requires.sys_id.toString())) {
                this.saveRecord(requiredProvider);
                this._gatherRequiredProviders(requiredProvider);
            }
            this.saveRecord(requiredProviderM2M);
        }
        return;
    },

    //Recursively gather all columns and column rows
    _gatherColumnsAndColumnRowsAndInstances: function(row) {
        //add columns
        var column = new GlideRecord("sp_column");
        column.addQuery("sp_row", row.sys_id.toString());
        column.query();
        while (column.next()) {
            //Add widget instances
            var widgetInstance = new GlideRecord("sp_instance");
            widgetInstance.addQuery("sp_column", column.sys_id.toString());
            widgetInstance.query();
            while (widgetInstance.next()) {
                //Add widget
                var widget = new GlideRecord("sp_widget");
                if (widget.get(widgetInstance.sp_widget.sys_id.toString())) {
                    this.saveRecord(widget);
                    this._addWidgetDependencies(widget);
                }
                this.saveRecord(widgetInstance);
            }
            //Add column rows
            var columnRow = new GlideRecord("sp_row");
            columnRow.addQuery("sp_column", column.sys_id.toString());
            columnRow.query();
            while (columnRow.next()) {
                this.saveRecord(columnRow);
                this._gatherColumnsAndColumnRowsAndInstances(columnRow);
            }
            this.saveRecord(column);
        }
        return;
    },

    //Recursively gather all child menu rectangle items
    _gatherChildMenuRectangleItems: function(menuRectangleItem) {
        var childMenuRectangleItem = new GlideRecord("sp_rectangle_menu_item");
        childMenuRectangleItem.addQuery("sp_rectangle_menu_item", menuRectangleItem.sys_id.toString());
        childMenuRectangleItem.query();
        while (childMenuRectangleItem.next()) {
            this.saveRecord(childMenuRectangleItem);
            this._gatherChildMenuRectangleItems(childMenuRectangleItem);
        }
    },

    /********************* End Service Portal Functions *********************/

    /********************* Begin Table &amp; Dictionary Functions *********************/
    //Add DB Object to the update set
    _addDbObject: function(record, tableName) {
        var tableCollection = new GlideRecord("sys_dictionary");
        tableCollection.addQuery("name", record.name.toString());
        tableCollection.addQuery("internal_type.name", "collection");
        tableCollection.query();
        if (tableCollection.next()) {
            //Add collection (table) and dependencies
            this.saveRecord(tableCollection);
            this._addFieldDependencies(tableCollection, 'sys_dictionary');
            this._addTableDependencies(tableCollection, 'sys_dictionary');
        }
    },

    //Add field to the update
    _addField: function(record, tableName) {
        this._addFieldDependencies(record, tableName);
        //If current record is a 'collection' (table), add all table dependencies
        if (record.internal_type.name.toString() == 'collection')
            this._addTableDependencies(record, tableName);
    },

    //Add table dependencies to the update set
    _addTableDependencies: function(record, tableName) {
        //Add table fields
        var tableField = new GlideRecord("sys_dictionary");
        tableField.addQuery("name", record.name.toString());
        tableField.addQuery("element", "DOES NOT CONTAIN", "sys_");
        tableField.addQuery("sys_id", "!=", record.sys_id.toString()); //Don't re-add self
        tableField.query();
        while (tableField.next()) {
            //Process table field
            this.saveRecord(tableField);
            //Process table field dependencies
            this._addFieldDependencies(tableField);
        }
        //Add ui sections &amp; elements
        var uiSection = new GlideRecord("sys_ui_section");
        uiSection.addQuery("name", record.name.toString());
        //uiSection.addQuery("view","Default view");
        uiSection.query();
        while (uiSection.next())
            this.saveRecord(uiSection);
        //Add form &amp; elements
        var formView = new GlideRecord("sys_ui_form");
        formView.addQuery("name", record.name.toString());
        //formView.addQuery("view","Default view");
        formView.query();
        while (formView.next())
            this.saveRecord(formView);
        //Add list views
        var listView = new GlideRecord("sys_ui_list");
        listView.addQuery("name", record.name.toString());
        //listView.addQuery("view", "Default view");
        listView.query();
        while (listView.next())
            this.saveRecord(listView);
        //Add related lists
        var relatedList = new GlideRecord("sys_ui_related_list");
        relatedList.addQuery("name", record.name.toString());
        //relatedList.addQuery("view", "Default view");
        relatedList.query();
        while (relatedList.next()) {
            this.saveRecord(relatedList);
            var relatedListEntry = new GlideRecord("sys_ui_related_list_entry");
            relatedListEntry.addQuery("list_id", relatedList.sys_id.toString());
            relatedListEntry.query();
            while (relatedListEntry.next())
                this.saveRecord(relatedListEntry);
        }
        //Add choices (redundant for non-extended fields)
        var choice = new GlideRecord("sys_choice");
        choice.addQuery("name", record.name.toString());
        choice.query();
        while (choice.next())
            this.saveRecord(choice);
        //Add dictionary overrides (redundant for non-extended fields)
        var override = new GlideRecord("sys_dictionary_override");
        override.addQuery("name", record.name.toString());
        override.query();
        while (override.next())
            this.saveRecord(override);
        //Add labels (redundant for non-extended fields)
        var label = new GlideRecord("sys_documentation");
        label.addQuery("name", record.name.toString());
        label.query();
        while (label.next())
            this.saveRecord(label);
        //Add field styles
        var fieldStyle = new GlideRecord("sys_ui_style");
        fieldStyle.addQuery("name", record.name.toString());
        fieldStyle.query();
        while (fieldStyle.next())
            this.saveRecord(fieldStyle);
        //Add access controls, access roles, &amp; roles (redundant for non-extended fields)
        var acl = new GlideRecord("sys_security_acl");
        acl.addQuery("name", record.name.toString()).addOrCondition("name", "STARTSWITH", record.name.toString() + '.');
        acl.query();
        while (acl.next()) {
            this.saveRecord(acl);
            var aclRole = new GlideRecord("sys_security_acl_role");
            aclRole.addQuery("sys_security_acl", acl.sys_id.toString());
            aclRole.query();
            while (aclRole.next()) {
                var role = new GlideRecord("sys_user_role");
                if (role.get(aclRole.sys_user_role.toString()))
                    this.saveRecord(role);
                this.saveRecord(aclRole);
            }
        }
        //Add client scripts
        var clientScript = new GlideRecord("sys_script_client");
        clientScript.addQuery("table", record.name.toString());
        clientScript.query();
        while (clientScript.next())
            this.saveRecord(clientScript);
        //Add business rules
        var businessRule = new GlideRecord("sys_script");
        businessRule.addQuery("collection", record.name.toString());
        businessRule.query();
        while (businessRule.next())
            this.saveRecord(businessRule);
        //Add ui actions
        var uiAction = new GlideRecord("sys_ui_action");
        uiAction.addQuery("table", record.name.toString());
        uiAction.query();
        while (uiAction.next()) {
            this.saveRecord(uiAction);
            var actionRole = new GlideRecord("sys_ui_action_role");
            actionRole.addQuery("sys_ui_action", uiAction.sys_id.toString());
            actionRole.query();
            while (actionRole.next()) {
                var role2 = new GlideRecord("sys_user_role");
                if (role2.get(actionRole.sys_user_role.toString()))
                    this.saveRecord(role2);
                this.saveRecord(actionRole);
            }
        }
        //Add ui policies
        var uiPolicy = new GlideRecord("sys_ui_policy");
        uiPolicy.addQuery("table", record.name.toString());
        uiPolicy.query();
        while (uiPolicy.next()) {
            this.saveRecord(uiPolicy);
            var uiPolicyAction = new GlideRecord("sys_ui_policy_action");
            uiPolicyAction.addQuery("ui_policy", uiPolicy.sys_id.toString());
            uiPolicyAction.query();
            while (uiPolicyAction.next())
                this.saveRecord(uiPolicyAction);
        }
        //Add data policies
        var dataPolicy = new GlideRecord("sys_data_policy2");
        dataPolicy.addQuery("model_table", record.name.toString());
        dataPolicy.query();
        while (dataPolicy.next()) {
            this.saveRecord(dataPolicy);
            var dataPolicyRule = new GlideRecord("sys_data_policy_rule");
            dataPolicyRule.addQuery("sys_data_policy", dataPolicy.sys_id.toString());
            dataPolicyRule.query();
            while (dataPolicyRule.next())
                this.saveRecord(dataPolicyRule);
        }
        //Add modules and applications (New Record &amp; List of Records only)
        var navModule = new GlideRecord("sys_app_module");
        navModule.addQuery("name", record.name.toString());
        navModule.addQuery("link_type", "IN", "NEW,LIST");
        navModule.query();
        while (navModule.next()) {
            var navApplication = new GlideRecord("sys_app_application");
            if (navApplication.get(navModule.application.toString()))
                this.saveRecord(navApplication);
            this.saveRecord(navModule);
        }
    },

    //Add field dependencies to the update set
    _addFieldDependencies: function(record, tableName) {
        //Add choices
        var choice = new GlideRecord("sys_choice");
        choice.addQuery("name", record.name.toString());
        choice.addQuery("element", record.element.toString());
        choice.query();
        while (choice.next())
            this.saveRecord(choice);
        //Add attributes
        var attributeM2M = new GlideRecord("sys_schema_attribute_m2m");
        attributeM2M.addQuery("schema", record.sys_id.toString());
        attributeM2M.query();
        while (attributeM2M.next()) {
            //Add attribute
            var attribute = new GlideRecord("sys_schema_attribute");
            if (attribute.get(attributeM2M.attribute.sys_id.toString()))
                this.saveRecord(attribute);
            //Add attribute m2m
            this.saveRecord(attributeM2M);
        }
        //Add labels
        var label = new GlideRecord("sys_documentation");
        label.addQuery("name", record.name.toString());
        label.addQuery("element", record.element.toString());
        label.query();
        while (label.next())
            this.saveRecord(label);
        //Add field styles
        var fieldStyle = new GlideRecord("sys_ui_style");
        fieldStyle.addQuery("name", record.name.toString());
        fieldStyle.addQuery("element", record.element.toString());
        fieldStyle.query();
        while (fieldStyle.next())
            this.saveRecord(fieldStyle);
        //Add dictionary overrides
        var override = new GlideRecord("sys_dictionary_override");
        override.addQuery("name", record.name.toString());
        override.addQuery("element", record.element.toString());
        override.query();
        while (override.next())
            this.saveRecord(override);
        //Add access controls, access roles, &amp; roles (redundant for non-extended fields)
        var acl = new GlideRecord("sys_security_acl");
        acl.addQuery("name", record.name.toString() + '.' + record.element.toString());
        acl.query();
        while (acl.next()) {
            this.saveRecord(acl);
            var aclRole = new GlideRecord("sys_security_acl_role");
            aclRole.addQuery("sys_security_acl", acl.sys_id.toString());
            aclRole.query();
            while (aclRole.next()) {
                var role = new GlideRecord("sys_user_role");
                if (role.get(aclRole.sys_user_role.toString()))
                    this.saveRecord(role);
                this.saveRecord(aclRole);
            }
        }
    },
	/********************* End Table &amp; Dictionary Functions *********************/

    type: 'addToUpdateSetUtils'
};