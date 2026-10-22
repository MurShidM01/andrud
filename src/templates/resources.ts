/**
 * Android XML resource generators (strings, colors, themes, icons, layouts, drawables, xml rules)
 */

import type { TemplateContext, GeneratedFile } from '../core/types.js';

export function generateStrings(ctx: TemplateContext): GeneratedFile {
  const displayName = ctx.appName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    path: 'app/src/main/res/values/strings.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${displayName}</string>
    <string name="app_name_short">${ctx.appNamePascal}</string>
    <string name="content_description_app_icon">Application icon</string>
</resources>
`
  };
}

export function generateColors(_ctx: TemplateContext): GeneratedFile {
  return {
    path: 'app/src/main/res/values/colors.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Primary Colors -->
    <color name="primary">#6750A4</color>
    <color name="primary_variant">#7F67BE</color>
    <color name="on_primary">#FFFFFF</color>

    <!-- Secondary Colors -->
    <color name="secondary">#625B71</color>
    <color name="secondary_variant">#7A7289</color>
    <color name="on_secondary">#FFFFFF</color>

    <!-- Tertiary Colors -->
    <color name="tertiary">#7D5260</color>
    <color name="on_tertiary">#FFFFFF</color>

    <!-- Background Colors -->
    <color name="background">#FFFBFE</color>
    <color name="on_background">#1C1B1F</color>
    <color name="surface">#FFFBFE</color>
    <color name="on_surface">#1C1B1F</color>

    <!-- Status Colors -->
    <color name="error">#B3261E</color>
    <color name="on_error">#FFFFFF</color>
    <color name="outline">#79747E</color>

    <!-- Icon Colors -->
    <color name="ic_launcher_background">#6750A4</color>
</resources>
`
  };
}

export function generateThemes(ctx: TemplateContext): GeneratedFile {
  const themeName = `Theme.${ctx.appNamePascal}`;

  if (ctx.uiFramework === 'compose') {
    return {
      path: 'app/src/main/res/values/themes.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="${themeName}" parent="Theme.Material3.Light.NoActionBar">
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:windowLightNavigationBar" tools:targetApi="27">true</item>
    </style>
</resources>
`
    };
  }

  return {
    path: 'app/src/main/res/values/themes.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="${themeName}" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorOnPrimary">@color/on_primary</item>
        <item name="colorPrimaryContainer">@color/primary_variant</item>
        <item name="colorSecondary">@color/secondary</item>
        <item name="colorOnSecondary">@color/on_secondary</item>
        <item name="colorTertiary">@color/tertiary</item>
        <item name="colorOnTertiary">@color/on_tertiary</item>
        <item name="android:colorBackground">@color/background</item>
        <item name="colorOnBackground">@color/on_background</item>
        <item name="colorSurface">@color/surface</item>
        <item name="colorOnSurface">@color/on_surface</item>
        <item name="colorError">@color/error</item>
        <item name="colorOnError">@color/on_error</item>
        <item name="colorOutline">@color/outline</item>
        <item name="android:statusBarColor">@color/surface</item>
        <item name="android:navigationBarColor">@color/surface</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:windowLightNavigationBar" tools:targetApi="27">true</item>
    </style>
</resources>
`
  };
}

export function generateNightThemes(ctx: TemplateContext): GeneratedFile {
  const themeName = `Theme.${ctx.appNamePascal}`;

  if (ctx.uiFramework === 'compose') {
    return {
      path: 'app/src/main/res/values-night/themes.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="${themeName}" parent="Theme.Material3.Dark.NoActionBar">
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLightStatusBar">false</item>
        <item name="android:windowLightNavigationBar" tools:targetApi="27">false</item>
    </style>
</resources>
`
    };
  }

  return {
    path: 'app/src/main/res/values-night/themes.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="${themeName}" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">#D0BCFF</item>
        <item name="colorOnPrimary">#381E72</item>
        <item name="colorPrimaryContainer">#4F378B</item>
        <item name="colorSecondary">#CCC2DC</item>
        <item name="colorOnSecondary">#332D41</item>
        <item name="colorTertiary">#EFB8C8</item>
        <item name="colorOnTertiary">#492532</item>
        <item name="android:colorBackground">#1C1B1F</item>
        <item name="colorOnBackground">#E6E1E5</item>
        <item name="colorSurface">#1C1B1F</item>
        <item name="colorOnSurface">#E6E1E5</item>
        <item name="colorError">#F2B8B5</item>
        <item name="colorOnError">#601410</item>
        <item name="colorOutline">#938F99</item>
        <item name="android:statusBarColor">#1C1B1F</item>
        <item name="android:navigationBarColor">#1C1B1F</item>
        <item name="android:windowLightStatusBar">false</item>
        <item name="android:windowLightNavigationBar" tools:targetApi="27">false</item>
    </style>
</resources>
`
  };
}

export function generateAppIcon(_ctx: TemplateContext): GeneratedFile {
  return {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
`
  };
}

export function generateActivityLayout(ctx: TemplateContext): GeneratedFile {
  if (ctx.uiFramework === 'compose') {
    return {
      path: 'app/src/main/res/layout/activity_main.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/background">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:text="@string/app_name"
        android:textAppearance="?attr/textAppearanceHeadlineMedium"
        android:textColor="@color/on_background" />

</FrameLayout>
`
    };
  }

  return {
    path: 'app/src/main/res/layout/activity_main.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/background"
    tools:context=".MainActivity">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/app_name"
        android:textAppearance="?attr/textAppearanceHeadlineMedium"
        android:textColor="@color/on_background"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <com.google.android.material.floatingactionbutton.FloatingActionButton
        android:id="@+id/fab"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_margin="16dp"
        android:contentDescription="@string/app_name_short"
        android:src="@drawable/ic_add"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:tint="@color/on_primary" />

</androidx.constraintlayout.widget.ConstraintLayout>
`
  };
}

export function generateDrawableResources(_ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: 'app/src/main/res/drawable/ic_launcher_background.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#6750A4"
        android:pathData="M0,0h108v108h-108z"/>
</vector>
`
    },
    {
      path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Android robot head stylized as "A" -->
    <group android:translateX="27" android:translateY="27">
        <!-- Circle background -->
        <path
            android:fillColor="#FFFFFF"
            android:pathData="M27,27m-24,0a24,24 0,1 1,48 0a24,24 0,1 1,-48 0"/>
        <!-- A shape -->
        <path
            android:fillColor="#6750A4"
            android:pathData="M27,42L17,22h4l6,12 6,-12h4L27,42zM24,35l2.5,-5 2.5,5h-5z"/>
        <!-- Antenna -->
        <path
            android:strokeColor="#6750A4"
            android:strokeWidth="2"
            android:pathData="M20,18L12,10"/>
        <path
            android:strokeColor="#6750A4"
            android:strokeWidth="2"
            android:pathData="M34,18L42,10"/>
    </group>
</vector>
`
    },
    {
      path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
`
    },
    // Fallback vector icons for API 24-25 (Android 7.0 / 7.1) before adaptive-icon (API 26)
    {
      path: 'app/src/main/res/mipmap-anydpi/ic_launcher.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@drawable/ic_launcher_background" />
    <item android:drawable="@drawable/ic_launcher_foreground" />
</layer-list>
`
    },
    {
      path: 'app/src/main/res/mipmap-anydpi/ic_launcher_round.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@drawable/ic_launcher_background" />
    <item android:drawable="@drawable/ic_launcher_foreground" />
</layer-list>
`
    },
    {
      path: 'app/src/main/res/drawable/ic_add.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
</vector>
`
    },
    {
      path: 'app/src/main/res/xml/backup_rules.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <!-- Exclude specific shared preferences or files if needed -->
</full-backup-content>
`
    },
    {
      path: 'app/src/main/res/xml/data_extraction_rules.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <!-- TODO: Use <include> and <exclude> to control what is backed up -->
    </cloud-backup>
</data-extraction-rules>
`
    }
  ];
}
