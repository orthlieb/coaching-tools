# **Project Title** 🛠️

_Tools for Life Language Coaches_

![GitHub License](https://img.shields.io/github/license/orthlieb/coaching-tools)  
![GitHub Repo Size](https://img.shields.io/github/repo-size/orthlieb/coaching-tools)  
![GitHub Stars](https://img.shields.io/github/starsorthlieb/coaching-tools?style=social)

---

## **📋 Table of Contents**

- [About the Project](#about-the-project)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## **📖 About the Project**

One of the biggest advantages of Life Languages is the ability to take groups of people, teams and organizations, and evaluate them. 
This project introduces a number of tools that allow you to generate client-side HTML for analysis.

## **🛠️ Tools**
### **Communication Indicators**
This tool fills out the Communication Indicators worksheet programmatically. Use the 
CI worksheet when you are coaching, especially if you turn on the forensics, which will tell you which languages are 
contributing to a particular CI. It should allow you to ask deeper questions and help the client gain more insights in 
their profile. Remember that when choosing to include forensics, do not distribute the sheet to the client!

If you provide a group of people, you can generate multiple worksheets which can be useful for coaching a group or doing
a group exercise.
### **LanguageGrams**
This tool creates a LanguageGram--a representation of the Life Languages that can be especially useful 
for those that process information visually. The primary Life Language occupies most of the gram in its appropriate 
color, followed by the second and third, and then the remaining languages. Dominant languages can be easily seen at a 
glance.

If you provide a group of people, you can generate multiple grams which can be useful for coaching a group or doing a 
group exercise.
### **Group Life Language Radar Graph**
This tool creates a Group Life Language Radar Graph for a team. The datasets are the 
different Life Languages in the appropriate color. They can be switched on and off using the legend in the graph or the 
column hide/show drop down on the chart.

You can add and remove team members by clicking on the checkbox next to their name. Click on the name of a team member 
to see their individual profile.

Click on a column heading to sort in descending/ascending order of that Life Language. A line is drawn at the 50 mark, 

### **Group People Radar Graph**
This tool creates a Group People Radar Graph. The datasets are the different members of the team. They can be switched 
on and off by clicking on the legend in the graph or by selecting the checkbox next to a team member's name.

You can add and remove Life Languages from the chart using the drop down in the table.

Click on the name of a team member to see their individual profile.

Click on a column heading in the chart to sort in descending/ascending order of that Life Language. A line is drawn at 
the 50 mark, indicating which team members are fluent in that Life Language.

### **Group Bar Chart**
This tool creates a Group Bar Chart. Just like an individual, a group also has a profile that can give you coaching
insights. 
- The top of each bar represents the maximum individual score for each Life Language. 
- The bottom of each bar represents the maximum individual score for each Life Language. 
- The middle bar represents the group score. The bottom of the bar represents the minimum individual score for that 
language. 
- The size of the bar is an indication of whether the group is closely aligned on that language (small bar) or not 
(large bar).

You can add and remove team members from the group by clicking on the checkbox next to their name. Click on the name of 
a team member to see their individual profile.

Click on a column heading to sort in descending/ascending order of that Life Language. A line is drawn at the 50 mark, 
indicating which team members are fluent in that Life Language.

### **Group Communication Indicators Bar Chart**
This tool creates a Group Communication Indicators Bar Chart. Just like an individual, the group has a blended set of 
CIs that can manifest themselves at the group level. The top of each bar represents the maximum individual score for 
each Communication Indicator. The middle bar represents the group score. The bottom of the bar represents the minimum 
individual score for that Communicaton Indicator. The size of the bar is an indication of whether the group is closely 
aligned on that language (small bar) or not (large bar).

You can add and remove team members from the group by clicking on the checkbox next to their name. Click on the name of 
a team member to see their Communication Indicators worksheet.

Click on a column heading to sort in descending/ascending order of that Communication Indicator.

---

## **🚀 Getting Started**

Follow these steps to set up the project locally.

### **Prerequisites**
- npm
- rimraf

### **Installation**

1. Clone the repo:
   ```bash
   git clone https://github.com/orthlieb/coaching-tools.git
   ```
2. Navigate to the project directory:
   ```bash
   cd coaching-tools
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

## **⚙️ Usage**

```bash
npm run build
```
After the build, you should be able use the html files in the app directory directly. They will generate test data if 
they are not provided with either json or csv data attached to the URL.

Here is an example to provide JSON data to the URL.

```javascript
let person1 = { fullName: "John Smith", companyName: "Acme Inc", mover: 65, doer: 77, ... };
let person2 = { fullName: "Jane Doe", companyName: "Acme Inc", mover: 56, doer: 88, ... };
let data= [ person1, person2 ];

let cTargetURLPrefix = "https://www.relatematters.com/coaching-tools/CommunicationIndicators.html";
let str = JSON.stringify(data);
let url = new URL(`${cTargetURLPrefix}?json=${encodeURIComponent(str)}`);
window.location.href = url;
```

Documentation for the various classes and files can be found in the docs folder after the build.

---

## **🤝 Contributing**

Contributions are welcome! Please follow these steps to contribute:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

---

## **📄 License**

Distributed under the MIT License. See `LICENSE` for more information.

---

## **📧 Contact**

Carl Orthlieb - [github@orthlieb.com](mailto:github@orthlieb.com.com)  
GitHub: [https://github.com/orthlieb](https://github.com/orthlieb)  

---

## **📝 Acknowledgements**

- Life Languages is copyright [Life Languages International](https://www.lifelanguages.com)