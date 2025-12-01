import os, psycopg
#url = os.environ["DATABASE_URL"] #no clue what env variables are but it works i guess
#FORGET ENVIRONMENT VARIABLES THEY SUCK
url = "postgresql://db4@localhost:5432/postgres"
def list_opps(): #get all available opportunities
    conn = psycopg.connect(url)
    cur = conn.cursor()
    cur.execute("""
    SELECT o.id, o.title, o.description, u.email
    FROM opportunities o
    JOIN users u ON u.id = o.user_id
    ORDER BY o.id;""")
    return cur.fetchall()

def add_opp(user_id, title, description): #automatically add opportunity
    conn = psycopg.connect(url)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO opportunities (user_id, title, description) VALUES (%s, %s, %s) RETURNING id;", #for validation
        (user_id, title, description)) #hehe
    conn.commit() #you moron, remember this next time
    return cur.fetchone()[0] #only want one bc its for validation

if __name__ == "__main__": #i think it's good practice to have this instead of just run main???
    print("Available opportunities:", list_opps())
    new_opp_id = add_opp(1, "cool opportunity", "inserted with python")
    print("Inserted id:", new_opp_id)
    print("New opp list:", list_opps())