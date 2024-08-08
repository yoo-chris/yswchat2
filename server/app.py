import subprocess

if __name__ == "__main__":
    services = [
        "./chat/chat.py",
        "./signin/signin.py",
        "./signup/signup.py"
    ]
    
    processes = []
    
    for service in services:
        process = subprocess.Popen(["python", service])
        processes.append(process)
    
    for process in processes:
        process.wait()