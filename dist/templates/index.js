/**
 * Template registry, metadata, and file generator exports
 */
import { resolveTemplateId } from '../core/config.js';
export * from './gradle.js';
export * from './wrapper.js';
export * from './project-files.js';
export * from './manifest.js';
export * from './resources.js';
export * from './sources.js';
export * from './kmp.js';
export const TEMPLATE_REGISTRY = [
    {
        id: 'kotlin-xml',
        name: 'Kotlin with XML Layouts',
        description: 'Traditional Android Views with Kotlin. Best for developers who prefer XML layouts and ViewBinding.',
        keywords: ['kotlin', 'xml', 'views', 'viewbinding', 'material'],
        features: ['Material Design 3', 'ViewBinding', 'Kotlin Coroutines', 'RecyclerView', 'ConstraintLayout'],
        language: 'kotlin',
        uiFramework: 'xml'
    },
    {
        id: 'kotlin-compose',
        name: 'Kotlin with Jetpack Compose',
        description: 'Modern declarative UI with Kotlin and Jetpack Compose. Latest Android UI toolkit with Material 3 support.',
        keywords: ['kotlin', 'compose', 'declarative', 'material3', 'modern'],
        features: ['Material Design 3', 'Compose Navigation', 'Kotlin Coroutines', 'ViewModel', 'Hilt'],
        language: 'kotlin',
        uiFramework: 'compose'
    },
    {
        id: 'java-xml',
        name: 'Java with XML Layouts',
        description: 'Traditional Android Views with Java. Ideal for teams maintaining Java codebases or preferring Java syntax.',
        keywords: ['java', 'xml', 'views', 'viewbinding', 'legacy'],
        features: ['Material Design 3', 'ViewBinding', 'Java 17', 'RecyclerView', 'ConstraintLayout'],
        language: 'java',
        uiFramework: 'xml'
    },
    {
        id: 'native-cpp',
        name: 'Kotlin with Native C++/NDK',
        description: 'Native C++ development with JNI integration. For high-performance code, game engines, or system-level programming.',
        keywords: ['kotlin', 'native', 'cpp', 'ndk', 'jni', 'cmake'],
        features: ['CMake Integration', 'JNI Bridge', 'Native Development', 'Multi-ABI Support', 'STL'],
        language: 'kotlin',
        uiFramework: 'xml'
    },
    {
        id: 'kotlin-multiplatform',
        name: 'Kotlin Multiplatform (Cross-Platform)',
        description: 'Cross-platform Kotlin Multiplatform & Compose Multiplatform project targeting Android, iOS, Desktop (JVM), and Web (Wasm).',
        keywords: ['kotlin', 'multiplatform', 'kmp', 'cmp', 'cross-platform', 'ios', 'android', 'desktop', 'wasm', 'web'],
        features: [
            'Compose Multiplatform Shared UI',
            'expect/actual Platform APIs',
            'Android + iOS + Desktop + Web (Wasm)',
            'Shared Module (:shared) & Version Catalog',
            'Kotlin Coroutines & Serialization'
        ],
        language: 'kotlin',
        uiFramework: 'compose',
        platforms: ['android', 'ios', 'desktop', 'wasmJs']
    }
];
/**
 * Get template metadata by ID (supports 'kmp' / 'cmp' aliases)
 */
export function getTemplateMetadata(id) {
    const resolved = resolveTemplateId(id);
    return TEMPLATE_REGISTRY.find((t) => t.id === resolved);
}
/**
 * Get all available templates
 */
export function getAllTemplates() {
    return [...TEMPLATE_REGISTRY];
}
/**
 * Search templates by query
 */
export function searchTemplates(query) {
    const lowerQuery = query.toLowerCase();
    return TEMPLATE_REGISTRY.filter((template) => {
        if (template.name.toLowerCase().includes(lowerQuery)) {
            return true;
        }
        if (template.description.toLowerCase().includes(lowerQuery)) {
            return true;
        }
        if (template.keywords.some((k) => k.toLowerCase().includes(lowerQuery))) {
            return true;
        }
        if (template.id.toLowerCase().includes(lowerQuery)) {
            return true;
        }
        return false;
    });
}
/**
 * Get templates by category
 */
export function getTemplatesByCategory(category) {
    return TEMPLATE_REGISTRY.filter((t) => {
        switch (category) {
            case 'kotlin':
                return t.language === 'kotlin';
            case 'java':
                return t.id === 'java-xml';
            case 'native':
                return t.id === 'native-cpp';
            case 'multiplatform':
                return t.id === 'kotlin-multiplatform';
            default:
                return false;
        }
    });
}
/**
 * Get template preview code
 */
export function getTemplatePreview(id) {
    const resolved = resolveTemplateId(id);
    const previews = {
        'kotlin-compose': `// MainActivity.kt
@Composable
fun MainScreen() {
    var count by remember { mutableIntStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Count: $count",
            style = MaterialTheme.typography.headlineMedium
        )
    }
}`,
        'kotlin-xml': `// MainActivity.kt
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}`,
        'java-xml': `// MainActivity.java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}`,
        'native-cpp': `// native-lib.cpp
#include <jni.h>
#include <string>

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_app_NativeLib_stringFromJNI(
    JNIEnv* env, jobject /* this */) {
    return env->NewStringUTF("Hello from C++");
}`,
        'kotlin-multiplatform': `// shared/src/App.kt (Shared across Android, iOS, Desktop & Web)
@Composable
fun App() {
    MaterialTheme {
        SharedScreen()
    }
}

// shared/src/Platform.kt
interface Platform {
    val name: String
}
expect fun getPlatform(): Platform`
    };
    return previews[resolved];
}
//# sourceMappingURL=index.js.map