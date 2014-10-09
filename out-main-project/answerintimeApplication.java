package com.answerintime.answerintime;

import android.os.Bundle;
import org.apache.cordova.*;

import android.app.Application;
import android.content.Context;

import com.parse.Parse;
import com.parse.ParseInstallation;
import com.parse.PushService;

import com.answerintime.answerintime.answerintime;

public class answerintimeApplication extends Application 
{
    private static answerintimeApplication instance = new answerintimeApplication();

    public answerintimeApplication() {
        instance = this;
    }

    public static Context getContext() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        // register device for parse
        Parse.initialize(this, "IScWyo9p63oekJrraak0OFJeF6sPkxEO44PKsZ8o", "TCJ2kIjT9GVEqNCR0GIxTdEbhlTISK9F9AS6vHmM");
        PushService.setDefaultPushCallback(this, answerintime.class);
        ParseInstallation.getCurrentInstallation().saveInBackground();
    }
}

