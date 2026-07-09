import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    genAIClient = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Route: Analyze payroll data using Gemini
  app.post("/api/analyze-payroll", async (req, res) => {
    try {
      const { query, summary } = req.body;
      if (!query) {
        return res.status(400).json({ error: "الرجاء إدخال سؤال أو استعلام" });
      }

      const ai = getGenAI();
      const prompt = `أنت خبير ومستشار مالي وإداري متخصص في شؤون الموظفين وكشوف الرواتب والبدلات والاستقطاعات في المملكة العربية السعودية.
لديك البيانات والملخص التالي لكشف الرواتب الحالي:
${JSON.stringify(summary, null, 2)}

سؤال المستخدم أو استعلامه:
"${query}"

المطلوب:
أجب على سؤال المستخدم بلغة عربية واضحة وموجزة ومهنية مع الاستناد إلى الأرقام المذكورة في الملخص. إذا سأل عن علاوة أو تعديل مالي، احسب التكلفة التقديرية وقدم نصيحة مالية سديدة. استخدم النقاط المنظمة والرموز التعبيرية المناسبة لسهولة القراءة.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const reply = response.text || "لم يتم استلام رد من النموذج.";
      return res.json({ reply });
    } catch (error: any) {
      console.error("Error in /api/analyze-payroll:", error);
      return res.status(500).json({ 
        error: error.message || "حدث خطأ أثناء معالجة الاستعلام بالذكاء الاصطناعي." 
      });
    }
  });

  // API Route: Extract working hours from image/PDF using Gemini
  app.post("/api/import-hours", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      if (!fileData || !mimeType) {
        return res.status(400).json({ error: "الرجاء تزويد ملف الاستيراد المشفر ونوع البيانات." });
      }

      const ai = getGenAI();

      const filePart = {
        inlineData: {
          mimeType: mimeType,
          data: fileData,
        },
      };

      const textPart = {
        text: `استخرج أسماء الموظفين وعدد الساعات الإجمالية الخاصة بكل منهم من هذا الملف (سواء كان صورة أو جدول أو مستند).
ابحث عن جدول يحتوي على أسماء الموظفين وعمود الساعات (والذي قد يكون باسم Total أو ساعات العمل أو المجموع وغالباً ما يكون مكتوباً باللون الأحمر).
قم باستخراج كل موظف مع ساعات العمل المقابلة له بدقة تامة.`,
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [filePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "اسم الموظف الكامل كما هو مكتوب في المستند أو الصورة",
                },
                hours: {
                  type: Type.NUMBER,
                  description: "عدد ساعات العمل الإضافية أو الإجمالية المقابلة لاسم الموظف",
                },
              },
              required: ["name", "hours"],
            },
          },
        },
      });

      const text = response.text || "[]";
      let parsedData = [];
      try {
        parsedData = JSON.parse(text.trim());
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", text, e);
      }

      return res.json({ data: parsedData });
    } catch (error: any) {
      console.error("Error in /api/import-hours:", error);
      return res.status(500).json({
        error: error.message || "حدث خطأ أثناء استخراج البيانات باستخدام الذكاء الاصطناعي.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
