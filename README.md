# YouTube Audio Downloader 🎵

![License](https://img.shields.io/github/license/Hexcss/Youtube_Audio_Downloader)
![Issues](https://img.shields.io/github/issues/Hexcss/Youtube_Audio_Downloader)
![Stars](https://img.shields.io/github/stars/Hexcss/Youtube_Audio_Downloader)

A robust and scalable Express.js API that allows users to convert and download YouTube videos as MP3 files. Built with TypeScript, this API features secure endpoints, rate limiting, and input validation to ensure reliability and safety.

![YouTube Audio Downloader Banner](https://th.bing.com/th/id/R.ead2c76fb473eea736195496208b378d?rik=qwH8TyGH9N7%2fPQ&pid=ImgRaw&r=0)

## 🚀 Features

- 🎧 Convert YouTube videos to MP3 format on-the-fly
- 🛡️ Secure endpoints with rate limiting
- 📝 Request payload validation
- 🖥️ Docker support for easy deployment

## 🛠️ Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Hexcss/personal-youtube-audio-downloader.git
cd personal-youtube-audio-downloader
```

2. **Install dependencies:**

```bash
npm install
```

3. **Run the server:**

```bash
npm start
```

## 📦 Docker Deployment

1. **Build the Docker image:**

```bash
docker build -t youtube-audio-downloader .
```

2. **Run the container:**

```bash
docker run -p 3000:3000 youtube-audio-downloader
```

## 📈 Usage

Send a POST request with a valid YouTube URL:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"url":"YOUR_YOUTUBE_URL"}' http://localhost:3000/api/ytdl/downloadmp3
```

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 🔏 License

[MIT](https://choosealicense.com/licenses/mit/)

---

Made with ❤️ by [Hexcss](https://github.com/Hexcss)
