# Alex Shieh's DOGE Demo

## Live Demo Link

[dogedemo.alexshieh.com](https://dogedemo.alexshieh.com) (no password needed)

## Overview

This is a full-stack, interactive data analysis demo built from scratch in under 48 hours to support my application to DOGE. It showcases real-time predictive modeling, dynamic data weighting, and interactive polling simulations.

While I’ve worked on large-scale polling projects before — including proprietary software that powered over a million robocalls and was cited by major news outlets like Fox News and MSNBC — this project was an opportunity to build an open-source alternative from first principles.

Users can

- From the frontend, train a ML (XGBoost) model based off survey data to predict how an individual with known demographic traits will vote. A probability distribution and SHAP analysis of how each characteristic influences the prediction are also computed and graphed.
- Use iterative proportional fitting to weight the data to meet certain demographic targets and see stats on how long it takes to converge.
- Read and write to the database, submitting new data and deleting existing data.
- View interactive data visualizations where the data can be filtered so only certain demographic groups are included. "Hypothetical polling" is also enabled, where users can see what the results would be if subgroups shifted in their voting habits.

## Author Contact

- [alexander_shieh@brown.edu](mailto:alexander_shieh@brown.edu)
- [alexshieh25@gmail.com](mailto:alexshieh25@gmail.com)
- (978) 300-2539

## Design Details

### Database

I built the database in PostgreSQL. I used a relational database because the stored polling data follows a structured format with identical fields in all the rows; other databases like MongoDB are better suited for unstructured JSON-like data. PostgreSQL is also more efficient for filtering data, which is needed for this demo, than MongoDB where analgous components of the data have no inherent relational tie.

### Backend

The backend is built with Python and Django. Java runs faster than Python in most cases because it's compiled ahead of time, while Python is often run just-in-time. But because Python's intepreter is built in C and ML libraries like numpy or XGBoost are backed by C or C++, Python is faster than Java for the sort of data analysis performed in this demo. Django was likewise a good fit for this project because it's Object-Relational Mapper makes SQL queries more secure and faster for developers to implement.

### Frontend

The front-end is built with TypeScript and React. React optimizes loading time with lazy loading, has built-in state management to keep track of filters, and allows the use of reusable components. TypeScript catches type errors at compile time, making it less error-prone.

### Iterative Proportional Fitting

Iterative Proprtional Fitting is performed to assign weights to raw data so the sample becomes distributed demographically exactly as is specified by the pre-set targets. It does so by setting a multiplier for each demographic subgroup, weighing rows by the product of all applicable multipliers, and iteratively adjusting the multipliers category by category until the difference between the data's distribution and the target distribution is below a certain threshold.

IPF has a runtime of O(rows x columns x iterations), because the constant-time process of reassigning weights occurs this many times. Because this demo has 6 columns and automatically stops the algorithm after 100 iterations, IPF has a worst-case runtime of O(600n), or just O(n), where n is the number of rows.

IPF is not mathematically guaranteed to converge, but with typical polling datasets it will. It doesn't converge in edge cases such as when an entire subgroup has 0 members (which will make it impossible to hit a non-zero target), or when two groups (for example urban and >100k in income) consist of exactly the same members (causing the algorithim to adjust the weights for those two categories back and forth forever).

### XGBoost, SHAP, & Probability Distribution
