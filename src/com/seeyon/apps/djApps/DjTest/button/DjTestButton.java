package com.seeyon.apps.djApps.DjTest.button;
import com.seeyon.cap4.form.bean.fieldCtrl.FormFieldCustomCtrl;
import org.springframework.stereotype.Component;
import java.util.List;
@Component
public class DjTestButton extends FormFieldCustomCtrl {

    public String getKey() {
        return "20260331dj";
    }

    public String getFieldLength() {
        return "255";
    }

    public void init() {
        setPluginId("djTest");
        setIcon("cap-icon-querystatistics");
    }

    public String getPCInjectionInfo() {
        return "{path:'apps_res/cap/customCtrlResources/djTest/'," +
                "jsUri:'js/djTest.js'," +
                "initMethod:'init'," +
                "nameSpace:'field_" + getKey() + "'}";
    }


    public String getMBInjectionInfo() {
        return "{path:'http://customctrlresources.v5.cmp/v1.0.0/'," +
                "weixinpath:'customCtrlResources'," +
                "jsUri:'djTest/js/djTestMbRunning.js'," +
                "initMethod:'init'," +
                "nameSpace:'field_" + getKey() + "'}";
    }

    public String getText() {
        return "Dj测试按钮";
    }

    public boolean canBathUpdate() {
        return false;
    }

    public List<String[]> getListShowDefaultVal(Integer externalType) {
        return null;
    }

    public String[] getDefaultVal(String defaultValue) {
        return new String[0];
    }

    public boolean canInjectionWord() {
        return false;
    }


}