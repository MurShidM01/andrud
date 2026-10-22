/**
 * AndroidManifest.xml generator
 */

import type { TemplateContext, GeneratedFile } from '../core/types.js';

export function generateAppManifest(ctx: TemplateContext): GeneratedFile {
  const applicationClass = `.${ctx.appNamePascal}Application`;
  const activityClass = `${ctx.packageName}.MainActivity`;

  return {
    path: 'app/src/main/AndroidManifest.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:name="${applicationClass}"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.${ctx.appNamePascal}">

        <activity
            android:name="${activityClass}"
            android:exported="true"
            android:theme="@style/Theme.${ctx.appNamePascal}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
`
  };
}
