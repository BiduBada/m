from flask import *
from random import randint
import json, os
from cryptography.fernet import Fernet

app = Flask(__name__)
MESSAGES_A = "temp/messages.a"
MESSAGES_B = "temp/messages.b"


def load_or_create_key():
    if not os.path.exists(MESSAGES_B):
        key = Fernet.generate_key()
        with open(MESSAGES_B, "wb") as f:
            f.write(key)
    else:
        with open(MESSAGES_B, "rb") as f:
            key = f.read()
    return Fernet(key)

fernet = load_or_create_key()


def load_messages():
    try:
        with open(MESSAGES_A, "rb") as f:
            encrypted_data = f.read()
            decrypted = fernet.decrypt(encrypted_data)
            return json.loads(decrypted.decode())
    except:
        return []


def save_messages(messages):
    json_data = json.dumps(messages).encode()
    encrypted = fernet.encrypt(json_data)
    with open(MESSAGES_A, "wb") as f:
        f.write(encrypted)





# def load_messages():
#     try:
#         with open(MESSAGES_A, "r") as f:
#             return json.load(f)
#     except:
#         return []

# def save_messages(messages):
#     with open(MESSAGES_A, "w") as f:
#         json.dump(messages, f)



@app.route("/messages", methods=["GET"])
def get_messages():
    return jsonify(load_messages())

@app.route("/messages", methods=["POST"])
def post_message():
    data = request.get_json()
    data["id"] = randint(0, 10000000000)


    messages = load_messages()
    messages.append(data)
    save_messages(messages)
    return jsonify({"status": "ok"})

@app.route("/", methods=["GET"])
def index():
    # data = request.args.get("data")
    # if data == str(0):
    # else:return render_template("data.html")

    return render_template("index.html")

@app.route("/notif", methods=["GET"])
def notif():


    return render_template("notif.html")
    

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

