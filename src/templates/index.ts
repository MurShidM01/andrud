/**
 * Template registry and metadata
 */

import type { TemplateType } from '../core/types.js';

interface TemplateMetadata {
  id: TemplateType;
  name: string;
  description: string;
  keywords: string[];
  features: string[];
  language: 'kotlin' | 'java';
  uiFramework: 'xml' | 'compose';
}

export type { TemplateMetadata };

export const TEMPLATE_REGISTRY: TemplateMetadata[] = [
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
  }
];

/**
 * Get template metadata by ID
 */
export function getTemplateMetadata(id: TemplateType): TemplateMetadata | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.id === id);
}

/**
 * Get all available templates
 */
export function getAllTemplates(): TemplateMetadata[] {
  return [...TEMPLATE_REGISTRY];
}

/**
 * Search templates by query
 */
export function searchTemplates(query: string): TemplateMetadata[] {
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
export function getTemplatesByCategory(category: 'kotlin' | 'java' | 'native'): TemplateMetadata[] {
  return TEMPLATE_REGISTRY.filter((t) => {
    switch (category) {
      case 'kotlin':
        return t.id === 'kotlin-xml' || t.id === 'kotlin-compose' || t.id === 'native-cpp';
      case 'java':
        return t.id === 'java-xml';
      case 'native':
        return t.id === 'native-cpp';
      default:
        return false;
    }
  });
}

/**
 * Get template preview code
 */
export function getTemplatePreview(id: TemplateType): string | undefined {
  const previews: Record<string, string> = {
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
}`
  };

  return previews[id];
}