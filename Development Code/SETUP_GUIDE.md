# Hospital & Medicine Services - Master Setup Guide

If you are migrating this project to a new computer, you must ensure that the target machine has the necessary runtime environments and databases installed. Follow this step-by-step guide to get the platform running perfectly.

---

## 1. Prerequisites (Software Requirements)
You will need to download and install the following software on the new computer:

### A. Node.js (Runtime Environment)
The entire Backend (Express) and Frontend (React/Vite) run on Node.js.
- **Download:** [https://nodejs.org/](https://nodejs.org/)
- **Version:** Download the **LTS (Long Term Support)** version.
- **Verification:** Open a terminal/command prompt and type `node -v` to ensure it is installed.

### B. MongoDB Community Server (Database)
The backend requires a local MongoDB instance to store Users, Medicines, Hospitals, and System Configurations.
- **Download:** [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **Important During Installation:** Make sure to install **MongoDB Compass** (the GUI viewer) when the installer prompts you. This allows you to visually inspect the database.
- **Verification:** Open MongoDB Compass and ensure it can connect to the default URI: `mongodb://127.0.0.1:27017/`

---

## 2. Setting Up the Project

Once you have copied the `Development Code` folder to your new computer, follow these steps to initialize it.

### Step 1: Install Backend Dependencies
The hidden `node_modules` folder is often excluded when copying projects. You must reinstall the backend packages.
1. Open a terminal and navigate to the Backend folder:
   ```bash
   cd path/to/Development Code/Backend
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. *(Optional)* If the database is completely empty on the new PC, run the seed script to populate initial medicines:
   ```bash
   node seedMedicines.js
   ```

### Step 2: Install Frontend Dependencies
1. Open a **new** terminal and navigate to the Frontend folder:
   ```bash
   cd path/to/Development Code/Frontend
   ```
2. Install the Vite/React packages:
   ```bash
   npm install
   ```

---

## 3. Running the Application

You must run **both** the backend server and the frontend client simultaneously in two separate terminal windows.

### Terminal 1: Start the Backend
1. In the `Backend` folder terminal, run:
   ```bash
   node server.js
   ```
   *(Alternatively, if you have nodemon installed globally, run `nodemon server.js`)*
2. **Success trigger:** You should see `MongoDB connected` and `Server running on port 3001` in the console.

### Terminal 2: Start the Frontend
1. In the `Frontend` folder terminal, run:
   ```bash
   npm run dev
   ```
2. **Success trigger:** Vite will compile the React code and give you a local network URL, usually: `http://localhost:5173/`

### Step 3: Access the Platform
Open your web browser (Chrome/Edge/Brave) and navigate to `http://localhost:5173/`. The Hospital & Medicine Services platform will now be fully operational!

---

> [!WARNING]  
> **Environment Variables:** If you separated your sensitive keys into a `.env` file (like `JWT_SECRET`), ensure you copy that `.env` file to the new computer as well, as those files are often hidden by operating systems!
