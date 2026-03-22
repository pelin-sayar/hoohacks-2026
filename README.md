Check out the DevPost: 

## ✨ Inspiration
Whether it's for documenting our most important and exciting moments or for sharing our lives with others through social media, we live in a vastly social age where documentation sits at the core of our lives. However, with this era of vast documentation comes the frustration and technical difficulty of capturing the "perfect shot". Taking pictures, staring at them, then taking them again... 10 times... while the birthday kid sits holding a smile for 20 minutes, all for the parent to capture the perfect memory. Most people wish their pictures looked more "professional" but feel intimidated by super technical terms that can be simplified to composition, lighting, and framing. Picto Pal aspires to give the average documenter that "pro-photographer" eye without overwhelming with highly technical terms, enhancing your life's best moments by turning casual snapshots into high-quality memories.
## 🤖 What it does
Picto Pal is an AI-driven photography coach designed to help you elevate your personal photography using devices we carry around everyday in our pockets. Using a live camera interface, the app analyzes your shot and gives you advice on one thing you can improve. When you capture a photo, the MediaDevices API sends the browser's current video feed to Gemini 2.5 and Gemini evaluates the composition, lighting, depth, layering, etc., and provides instant, actionable advice such as "center subject in the frame" or "too much light coming from the window, try moving away from it" to help you bridge the gap between a simple and professional-looking photograph.
## 🛠️ How we built it
- Frontend: React and Vite.
- Backend: Firebase (Firestore & Auth) to handle user accounts and images in gallery.
- AI Engine: Gemini 2.5 to analyze the images and provide instant technical guidance.
- API: Gemini 2.5 
- Styling: Tailwind CSS 
## 👾 Challenges we ran into
There were many challenges throughout the course of this project. I faced significant issues with integrating user authentication using Firebase. As a first time user of Firebase, there was a steep learning curve, especially since I ended up integrating authentication after completing most of the project and finishing the backend connection. Mapping unique user IDs to specific galleries in Firestore while maintaining a seamless UI required learning about security rules and state management. The second major issue was managing Gemini API quota. The original plan for Picto Pal was to make it a real-time system where the frontend would send the current image every 2-5seconds to Gemini and query for instant feedback without needing to click the capture button to save the picture, hence letting you move around and perfect the framing before saving your picture; however, this proved to be very expensive in terms of the amount of API credits it used in a very short amount of time. I ended up burning through the daily quota in about about 20 minutes into creating the app, indicating a major problem. Taking the constraints of limited free API quota into account, I had to shift the project to analyze pictures after the capture button was clicked, instead of continuous feedback, and used a secondary email for a new API key.
## 🎉 Accomplishments that we're proud of
- AI analysis of image: integrated Gemini to provide useful analysis of image taken, while keeping it user friendly for the average consumer by avoiding technically dense terms.
- Successfully building a real-time feedback loop that stores both the image and the AI’s expert advice in a cloud-hosted database.
- Implementing database: the website uploads to and displays images and AI analysis from the database in real-time.
- Integrating a user friendly, intuitive UI.
- Using Generative AI to help with code planning, speeding up development, and learning about new software.
## 📝 What we learned
- Firebase: Firestore & Auth
- Vercel: Deployment and env set up
- Using Gemini APIs to enhance project: prompt engineering for image analysis
- Intricate API permission scopes 
- Adapting to constraints such as limited free API quotas
## 👀 What's next for Picto Pal
- Integrating real-time Gemini feedback on images by taking snapshots of the current frame and sending queries every 2-4 seconds to analyze image before capturing and saving.
- Integrating ElevenLabs Voice Synthesis to turn Gemini's written feedback into natural sounding spoken text, so the you can continue to be immersed by the scene you are capturing without needing to pause and read feedback.
