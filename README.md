# Alex Shieh's DOGE Demo

## Live Demo Link

[dogedemo.alexshieh.com](https://dogedemo.alexshieh.com) (no password needed)

## Overview

This is a full-stack, interactive data analysis demo built from scratch in under 48 hours to support my application to DOGE. It showcases real-time predictive modeling, dynamic data weighting, and interactive polling simulations.

While I’ve worked on large-scale polling projects before — including proprietary software that powered over a million robocalls and was cited by major news outlets like Fox News and MSNBC — this project was an opportunity to build an open-source alternative from first principles.

Users can:

- Use iterative proportional fitting to weight the data to meet certain demographic targets and see stats on how long it takes to converge.
- Read and write to the database, submitting new data and deleting existing data.
- View interactive data visualizations where the data can be filtered so only certain demographic groups are included. "Hypothetical polling" is also enabled, where users can see what the results would be if subgroups shifted in their voting habits.
- From the frontend, train an ML (XGBoost) model based on survey data to predict how an individual with known demographic traits will vote. A probability distribution and SHAP analysis of how each characteristic influences the prediction are also computed and graphed.

## Author Contact

- [alexander_shieh@brown.edu](mailto:alexander_shieh@brown.edu)
- [alexshieh25@gmail.com](mailto:alexshieh25@gmail.com)
- (978) 300-2539

## Design Details

### Database

I built the database in PostgreSQL. I used a relational database because the stored polling data follows a structured format with identical fields in all the rows; other databases like MongoDB are better suited for unstructured JSON-like data. PostgreSQL is also more efficient for filtering data, which is needed for this demo, than MongoDB, where analogous components of the data have no inherent relational tie.

### Backend

The backend is built with Python and Django. Java runs faster than Python in most cases because it's compiled ahead of time, while Python is often run just-in-time. But because Python's interpreter is built in C and ML libraries like NumPy or XGBoost are backed by C or C++, Python is faster than Java for the sort of data analysis performed in this demo. Django was likewise a good fit for this project because its Object-Relational Mapper makes SQL queries more secure and faster for developers to implement.

### Frontend

The front-end is built with TypeScript and React. React optimizes loading time with lazy loading, has built-in state management to keep track of filters, and allows the use of reusable components. TypeScript catches type errors at compile time, making it less error-prone.

### Iterative Proportional Fitting

Iterative Proportional Fitting is performed to assign weights to raw data so the sample becomes distributed demographically exactly as specified by the pre-set targets. It does so by setting a multiplier for each demographic subgroup, weighing rows by the product of all applicable multipliers, and iteratively adjusting the multipliers category by category until the difference between the data's distribution and the target distribution is below a certain threshold.

IPF has a runtime of O(rows × columns × iterations) because the constant-time process of reassigning weights occurs this many times. Because this demo has six columns and automatically stops the algorithm after 100 iterations, IPF has a worst-case runtime of O(600n), or just O(n), where n is the number of rows.

IPF is not mathematically guaranteed to converge, but with typical polling datasets, it will. It doesn't converge in edge cases such as when an entire subgroup has 0 members (which makes it impossible to hit a non-zero target) or when two groups (for example, urban and >100k in income) consist of exactly the same members (causing the algorithm to adjust the weights for those two categories back and forth forever).

### XGBoost

The predictions are implemented using Extreme Gradient Boosting with one-hot encoding. The one-hot encoding is utilized because attributes like white, Black, Hispanic, and Asian have no relation to one another, yet encoding them with the same variable could lead the model to think Asian is closer to Hispanic than white. XGBoost is better at making predictions than alternatives like logistic regression because independent categories don't necessarily cause additive effects but can be related in non-linear ways; for example, being college-educated is far more decisive of political leanings for those 18–29 than those 65+.
