import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, GridSearchCV, learning_curve
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

import joblib

# =========================
# 1. LOAD DATA
# =========================
df = pd.read_csv("../data/train.csv")

# =========================
# 2. FEATURE SELECTION
# =========================
features = [
    "Neighborhood",
    "LotArea",
    "OverallQual",
    "OverallCond",
    "YearBuilt",
    "TotalBsmtSF",
    "GrLivArea",
    "FullBath",
    "BedroomAbvGr"
]

X = df[features]
y = df["SalePrice"]

# Log transform target (important improvement)
y = np.log1p(y)

# =========================
# EDA: Histogram SalePrice
# =========================
plt.figure()
plt.hist(df["SalePrice"], bins=40)
plt.title("Distribution of Original SalePrice")
plt.xlabel("SalePrice")
plt.ylabel("Frequency")
plt.show()

plt.figure()
plt.hist(np.log1p(df["SalePrice"]), bins=40)
plt.title("Distribution of Log-Transformed SalePrice")
plt.xlabel("Log(SalePrice + 1)")
plt.ylabel("Frequency")
plt.show()

# =========================
# 3. TRAIN / VAL / TEST SPLIT (70/15/15)
# =========================
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.3, random_state=42
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42
)

print("Train size:", X_train.shape)
print("Val size:", X_val.shape)
print("Test size:", X_test.shape)

# =========================
# 4. PREPROCESSING
# =========================
categorical_features = ["Neighborhood"]
numeric_features = [col for col in features if col != "Neighborhood"]

numeric_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median"))
])

categorical_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore"))
])

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, numeric_features),
        ("cat", categorical_transformer, categorical_features)
    ]
)

# =========================
# 5. DEFINE MODELS
# =========================
models = {
    "Linear Regression": LinearRegression(),
    "Decision Tree": DecisionTreeRegressor(random_state=42),
    "Random Forest": RandomForestRegressor(random_state=42)
}

results = {}

# =========================
# 6. TRAIN & EVALUATE BASE MODELS
# =========================
for name, model in models.items():
    pipe = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", model)
    ])

    pipe.fit(X_train, y_train)
    preds = pipe.predict(X_val)

    mae = mean_absolute_error(y_val, preds)
    rmse = np.sqrt(mean_squared_error(y_val, preds))
    r2 = r2_score(y_val, preds)

    results[name] = {
        "MAE": mae,
        "RMSE": rmse,
        "R2": r2
    }

# =========================
# 7. HYPERPARAMETER TUNING - RANDOM FOREST
# =========================
param_grid = {
    "regressor__n_estimators": [100, 200],
    "regressor__max_depth": [None, 10, 20],
    "regressor__min_samples_split": [2, 5]
}

rf_pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(random_state=42))
])

grid_search = GridSearchCV(
    rf_pipeline,
    param_grid,
    cv=5,
    scoring="neg_mean_absolute_error",
    n_jobs=-1
)

grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_

# Evaluate tuned model
val_preds = best_model.predict(X_val)

results["Tuned Random Forest"] = {
    "MAE": mean_absolute_error(y_val, val_preds),
    "RMSE": np.sqrt(mean_squared_error(y_val, val_preds)),
    "R2": r2_score(y_val, val_preds)
}

# =========================
# 8. PRINT RESULTS
# =========================
print("\n===== VALIDATION RESULTS =====")
for model_name, metrics in results.items():
    print(f"\n{model_name}")
    for metric, value in metrics.items():
        print(f"{metric}: {value:.4f}")

# =========================
# 9. FINAL TEST EVALUATION
# =========================
test_preds_log = best_model.predict(X_test)
test_preds = np.expm1(test_preds_log)
y_test_real = np.expm1(y_test)

print("\n===== TEST RESULTS (Best Model) =====")

mae = mean_absolute_error(y_test_real, test_preds)
rmse = np.sqrt(mean_squared_error(y_test_real, test_preds))
r2 = r2_score(y_test_real, test_preds)

print(f"Model Accuracy (R2): {r2:.3f}")
print(f"Average Error (MAE): ${mae:,.0f}")
print(f"RMSE: ${rmse:,.0f}")

# PREDICTED vs ACTUAL PLOT
plt.figure(figsize=(6,6))
plt.scatter(y_test_real, test_preds, alpha=0.6)
plt.xlabel("Actual Price ($)")
plt.ylabel("Predicted Price ($)")
plt.title("Actual vs Predicted House Prices")

# Perfect prediction line
min_price = min(y_test_real.min(), test_preds.min())
max_price = max(y_test_real.max(), test_preds.max())
plt.plot([min_price, max_price], [min_price, max_price], color="red")
plt.tight_layout()
plt.show()

# =========================
# 10. LEARNING CURVE
# =========================
train_sizes, train_scores, val_scores = learning_curve(
    best_model,
    X_train,
    y_train,
    cv=5,
    scoring="neg_mean_absolute_error",
    n_jobs=-1
)

train_scores_mean = -train_scores.mean(axis=1)
val_scores_mean = -val_scores.mean(axis=1)

plt.figure()
plt.plot(train_sizes, train_scores_mean, label="Train MAE")
plt.plot(train_sizes, val_scores_mean, label="Validation MAE")
plt.xlabel("Training Size")
plt.ylabel("MAE")
plt.title("Learning Curve")
plt.legend()
plt.show()

# FEATURE IMPORTANCE
rf_model = best_model.named_steps["regressor"]

# lấy feature names sau khi OneHot
cat_features = best_model.named_steps["preprocessor"] \
    .named_transformers_["cat"] \
    .named_steps["onehot"] \
    .get_feature_names_out(["Neighborhood"])

feature_names = numeric_features + list(cat_features)

importances = rf_model.feature_importances_

feat_imp = pd.DataFrame({
    "Feature": feature_names,
    "Importance": importances
})

feat_imp = feat_imp.sort_values(by="Importance", ascending=False)

feat_imp_top = feat_imp.head(10)
plt.figure(figsize=(8,5))
plt.barh(feat_imp_top["Feature"], feat_imp_top["Importance"])
plt.gca().invert_yaxis()
plt.xlabel("Importance")
plt.title("Top 10 Feature Importance")
plt.tight_layout()
plt.show()

# =========================
# 11. SAVE MODEL
# =========================
joblib.dump(best_model, "model.pkl")
print("\nBest model saved as model.pkl")