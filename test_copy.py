#app.py
#Import necessary packages
from flask import Flask
from flask_restful import Resource, reqparse, Api 
import requests
import json
from flask_cors import CORS
#Instantiate a flask object 
app = Flask(__name__)
#Instantiate Api object
api = Api(app)
CORS(app)
parser = reqparse.RequestParser()                      
parser.add_argument('barcode', type=str, required=True, help="Enter the product's barcode")    
parser.add_argument('conditions', type=str, required=True, help="Enter the requirements")
def isVeg(product):
        tags = product["product"]["ingredients_analysis_tags"]
        veg = True
        vege = True
        if ("non" in tags[1]):
            veg = False
        if ("non" in tags[2]):
            vege = False   
        return veg,vege

def get_ingredients(typ, product):
    faulty = {"maybe": [], "unknown" : []}
    ingredients = product["product"]["ingredients"]
    for element in ingredients:
        if "has_sub_ingredients" not in element.keys():
            if typ in element.keys():
                if (element[typ] != "yes"):
                    faulty["maybe"] = faulty.get("maybe") + [element["text"]]
        else:
            faulty["unknown"] = faulty.get("unknown") + [element["text"]]
    return faulty

def get_sem(res):
    for element in res.keys():
        if res[element] == 0:
            return "RED"
        elif res[element] == 1:
            return "YELLOW"
    return "GREEN"

class Test(Resource):
    def get(self):
        args = parser.parse_args()
        barcode = args["b   arcode"]
        conditions = json.loads(args["conditions"])        
        product = "https://world.openfoodfacts.org/api/v0/product/" + barcode + ".json"
        productreq = requests.get(product)
        productvalues = json.loads(productreq.content)
        jconditions = {}
        res = {}
        if (productvalues["status"]):
            aux = "".join(productvalues["product"]["labels_tags"])
            if ("image_url" in productvalues["product"].keys()):
                jconditions["image"] = productvalues["product"]["image_url"]
            else:
                jconditions["image"] = "Not Found"
            jconditions["name"] = productvalues["product"]["product_name"]
            jconditions["code"] = 1
            if (conditions["gluten"]):
                allergens = productvalues["product"]["allergens_hierarchy"]
                gluten = 2
                for allergen in allergens:
                    if "gluten" in allergen:
                        gluten = 0
                res["gluten"] = gluten
            veg, vege = isVeg(productvalues)
            if (conditions["vegan"]):
                if(conditions["vegan"] == veg):
                    ingredients = get_ingredients("vegan", productvalues)
                    if not(ingredients["maybe"]):
                        res["vegan"] = 2
                    else:
                        if("vegan" in aux):
                            res["vegan"] = 2
                        else:
                            res["vegan"] = 1
                    jconditions["ingredients"] = ingredients
                else:
                    res["vegan"] = 0
            elif (conditions["vegetarian"]):
                if(conditions["vegetarian"] == vege):
                    ingredients = get_ingredients("vegetarian", productvalues)
                    jconditions["ingredients"] = ingredients
                    if(ingredients["maybe"]):
                        if("vegetarian" in aux):
                            res["vegetarian"] = 2
                        else:
                            res["vegetarian"] = 1
                    else:
                    res["vegetarian"] = 2
                else:
                    res["vegetarian"] = 0
            jconditions["sem"] = get_sem(res)
            jconditions["res"] = res
        else:
            jconditions["code"] = 0
        return jconditions

api.add_resource(Test, '/query')

if __name__=='__main__':        
    #Run the applications
    app.run()