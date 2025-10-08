# 💬 DataChat – Chat with Your Data

**DataChat** is an AI-powered web application that allows users to **upload datasets**, **automatically generate visual insights**, and **converse with their data** through natural language queries.  

It bridges the gap between **data visualization** and **AI-driven analytics**, enabling anyone to explore datasets effortlessly.

<p align="center"> <img src="templates/ui3.png" alt="User Interface" width="600"/> <br> <em>Fig 5. User Interface</em> </p>
---

## 🚀 Features

- 📁 **Dataset Upload** – Upload CSV or Excel files for instant analysis  
- 📊 **Auto Chart Generation** – Automatically generate interactive charts with Plotly  
- 🤖 **Chat with Data** – Ask questions about your dataset using natural language  
- 💾 **Data Persistence** – Store uploaded datasets and chat history in MongoDB  
- ⚡ **Modern UI** – Built with Next.js and Tailwind CSS for a smooth experience  

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/) |
| **Charts** | [Plotly.js](https://plotly.com/javascript/) |
| **Backend** | Next.js API Routes |
| **AI Integration** | [OpenAI API](https://platform.openai.com/docs/api-reference) |
| **Database** | [MongoDB](https://www.mongodb.com/) |
| **File Parsing** | [Papaparse](https://www.papaparse.com/) / [Multer](https://github.com/expressjs/multer) |

---

## 🏗️ Architecture Overview

```plaintext
User → Next.js Frontend → API Routes → MongoDB
                          ↘
                           → OpenAI API → Chart Summaries & Insights
