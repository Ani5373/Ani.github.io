document.addEventListener('DOMContentLoaded', function() {//DOM加载完成 
    const calendar = {//日历对象    
        currentYear: new Date().getFullYear(),//当前年份
        currentMonth: new Date().getMonth(),//当前月份
        init: function() {//初始化日历  
            this.renderCalendar();//渲染日历
            document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));//前一个月
            document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));//后一个月
            document.getElementById('year').addEventListener('click', () => this.showYearSelection());//年份选择
            document.getElementById('month').addEventListener('click', () => this.showMonthSelection());//月份选择
            document.getElementById('todayButton').addEventListener('click', () => this.goToToday());//回到今天
        },
        renderCalendar: function() {//用JavaScript 的内置 Date 对象做阳历
            const year = this.currentYear;//当前年份
            const month = this.currentMonth;//当前月份
            const firstDay = new Date(year, month, 1).getDay();//当前月份第一天是星期几
            const daysInMonth = new Date(year, month + 1, 0).getDate();//下个月的上个月的最后一天
            const daysInPrevMonth = new Date(year, month, 0).getDate();//前一个月的天数
            const calendarBody = document.getElementById('calendarBody');//日历主体
            calendarBody.innerHTML = '';

            document.getElementById('year').textContent = year;//显示当前年份 
            document.getElementById('month').textContent = month + 1;//显示当前月份 

            const solarFestivals = {//阳历节日
                '1-1': '元旦',
                '2-14': '情人节',
                '3-8': '妇女节',
                '3-12': '植树节',
                '4-1': '愚人节',
                '5-1': '劳动节',
                '5-4': '青年节',
                '6-1': '儿童节',
                '8-1': '建军节',
                '9-10': '教师节',
                '10-1': '国庆节',
                '10-31': '万圣节',
                '12-24': '平安夜',
                '12-25': '圣诞节'
            };

            const lunarFestivals = {//农历节日
                '12-30': '除夕',
                '2-2': '龙抬头',
                '7-15': '中元节',
                '5-5': '端午节',
                '7-7': '七夕节',
                '12-23': '小年',
                '12-8': '腊八',
                '1-15': '元宵'
            };

            let date = 1;//日期
            let nextMonthDate = 1;//下个月日期

            for (let i = 0; i < 5; i++) {//行
                const row = document.createElement('tr');//创建行
                for (let j = 0; j < 7; j++) {//列
                    const cell = document.createElement('td');//创建单元格
                    if (i === 0 && j < firstDay) {//如果当前行是第一行且当前列小于第一天
                        cell.textContent = daysInPrevMonth - firstDay + j + 1;//填充前一个月的日期
                        cell.classList.add('filler-day');//填充日期样式
                    } else if (date > daysInMonth) {//如果日期大于当前月份的天数
                        cell.textContent = nextMonthDate++;//填充下一个月的日期
                        cell.classList.add('filler-day');//填充日期样式     
                    } else {
                        const lunarDate = Lunar.fromDate(new Date(year, month, date));//农历日期
                        const solarTerm = lunarDate.getJieQi();//节气
                        const lunarMonthDay = `${lunarDate.getMonth()}-${lunarDate.getDay()}`;
                        const solarFestival = solarFestivals[`${month + 1}-${date}`];
                        const lunarFestival = lunarFestivals[lunarMonthDay];

                        if (solarTerm) {
                            cell.innerHTML = `${date}<br><small class="solar-term">${solarTerm}</small>`;
                        } else if (solarFestival || lunarFestival) {
                            const festivalName = solarFestival || lunarFestival;
                            const festivalClass = (festivalName === '元旦' || festivalName === '国庆节' || lunarFestival) ? 'festival' : 'holiday';
                            cell.innerHTML = `${date}<br><small class="${festivalClass}">${festivalName}</small>`;
                        } else {
                            cell.innerHTML = `${date}<br><small>${lunarDate.getDayInChinese()}</small>`;
                        }

                        if (date === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                            cell.classList.add('current-day');
                        }
                        date++;
                    }
                    row.appendChild(cell);
                }
                calendarBody.appendChild(row);
            }
            this.addTooltipEvents(); // 添加悬浮框事件
        },
        showYearSelection: function() {
            const calendarTable = document.getElementById('calendarTable');
            calendarTable.classList.add('fade-out');
            setTimeout(() => {
                const calendarBody = document.getElementById('calendarBody');
                calendarBody.innerHTML = '';
                const startYear = this.currentYear - 20; // 前后20年
                for (let i = 0; i < 6; i++) {
                    const row = document.createElement('tr');
                    for (let j = 0; j < 7; j++) {
                        const year = startYear + i * 7 + j;
                        const cell = document.createElement('td');
                        cell.textContent = year;
                        cell.classList.add('year-cell');
                        cell.addEventListener('click', () => {
                            this.currentYear = year;
                            this.renderCalendar();
                        });
                        row.appendChild(cell);
                    }
                    calendarBody.appendChild(row);
                }
                calendarTable.classList.remove('fade-out');
            }, 300);
        },
        showMonthSelection: function() {
            const calendarTable = document.getElementById('calendarTable');
            calendarTable.classList.add('fade-out');
            setTimeout(() => {
                const calendarBody = document.getElementById('calendarBody');
                calendarBody.innerHTML = '';
                const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
                for (let i = 0; i < 3; i++) {
                    const row = document.createElement('tr');
                    for (let j = 0; j < 4; j++) {
                        const monthIndex = i * 4 + j;
                        const cell = document.createElement('td');
                        cell.textContent = months[monthIndex];
                        cell.classList.add('month-cell');
                        cell.addEventListener('click', () => {
                            this.currentMonth = monthIndex;
                            this.renderCalendar();
                        });
                        row.appendChild(cell);
                    }
                    calendarBody.appendChild(row);
                }
                calendarTable.classList.remove('fade-out');
            }, 300);
        },
        changeMonth: function(offset) {
            const calendarTable = document.getElementById('calendarTable');
            calendarTable.classList.add('fade-out');
            setTimeout(() => {
                this.currentMonth += offset;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                } else if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.renderCalendar();
                calendarTable.classList.remove('fade-out');
            }, 300);
        },
        goToToday: function() {//回到今天   
            this.currentYear = new Date().getFullYear();
            this.currentMonth = new Date().getMonth();
            this.renderCalendar();
        },
        addTooltipEvents: function() {//悬浮框事件  
            const calendarBody = document.getElementById('calendarBody');
            const tooltip = document.querySelector('.tooltip');
            const dialog = document.getElementById('dialog');
            const userInput = document.getElementById('userInput');
            const saveButton = document.getElementById('saveButton');
            const closeButton = document.getElementById('closeButton');

            if (!tooltip) return;

            const getZodiac = (month, day) => {//获取星座   
                const zodiacs = [
                    "摩羯座", "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座",
                    "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座"
                ];
                const lastDay = [19, 18, 20, 19, 20, 21, 22, 22, 22, 23, 22, 21];
                return day <= lastDay[month] ? zodiacs[month] : zodiacs[(month + 1) % 12];
            };

            calendarBody.addEventListener('mouseover', (event) => {//悬浮框显示 
                if (event.target.tagName === 'TD' && !event.target.classList.contains('filler-day') && !event.target.classList.contains('year-cell') && !event.target.classList.contains('month-cell')) {
                    const date = new Date(this.currentYear, this.currentMonth, parseInt(event.target.textContent));
                    const lunarDate = Lunar.fromDate(date);
                    const dayOfWeek = date.toLocaleDateString('zh-CN', { weekday: 'long' });
                    const zodiac = getZodiac(date.getMonth(), date.getDate());
                    const lunarInfo = `${lunarDate.getYearInGanZhi()}年 ${lunarDate.getMonthInGanZhi()}月 ${lunarDate.getDayInGanZhi()}日`;

                    tooltip.style.display = 'block';
                    tooltip.style.left = `${event.pageX + 10}px`;
                    tooltip.style.top = `${event.pageY + 10}px`;
                    tooltip.innerHTML = `
                        <div style="font-weight: bold;">${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${dayOfWeek}</div>
                        <div style="color: red;">${zodiac}</div>
                        <div style="color: gray;">农历${lunarDate.getMonth()}月${lunarDate.getDay()}日</div>
                        <div style="color: gray;">${lunarInfo}</div>
                        <button id="addSchedule" style="margin-top: 10px;">添加日程</button>
                        <button id="addDiary" style="margin-top: 5px;">添加日记</button>
                    `;



                    tooltip.querySelector('#addSchedule').onclick = () => {//添加日程   
                        dialog.style.display = 'block';//显示对话框 
                        saveButton.onclick = function() {//保存按钮
                            const content = userInput.value;
                            if (content) {
                                const url = '/add_schedule';
                                const selectedCell = event.target.closest('td');
                                
                                if (!selectedCell) {
                                    console.error('Selected cell not found');
                                    return;
                                }

                                const selectedDate = new Date(calendar.currentYear, calendar.currentMonth, parseInt(selectedCell.textContent));
                                const createdAt = new Date().toISOString().split('T')[0];


                                //发送HTTP请求
                                fetch(url, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        user_id: 1, // 示例用户ID
                                        date: `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`,
                                        event: content,
                                        created_at: createdAt
                                    })
                                })
                                .then(response => response.json())
                                .then(data => {
                                    alert(data.message);
                                    dialog.style.display = 'none';
                                    userInput.value = '';
                                    fetchAndDisplayData(); // 刷新数据
                                })
                                .catch(error => console.error('Error:', error));
                            } else {
                                alert('请输入内容');
                            }
                        };
                    };

                    tooltip.querySelector('#addDiary').onclick = () => {//添加日记  
                        dialog.style.display = 'block';
                        saveButton.onclick = function() {
                            const content = userInput.value;
                            if (content) {
                                const url = '/add_diary';
                                const selectedCell = event.target.closest('td');
                                
                                if (!selectedCell) {
                                    console.error('Selected cell not found');
                                    return;
                                }

                                const selectedDate = new Date(calendar.currentYear, calendar.currentMonth, parseInt(selectedCell.textContent));
                                const createdAt = new Date().toISOString().split('T')[0];

                                fetch(url, {//发送HTTP请求
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        user_id: 1, // 示例用户ID
                                        date: `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`,
                                        content: content,
                                        created_at: createdAt
                                    })
                                })
                                .then(response => response.json())
                                .then(data => {
                                    alert(data.message);
                                    dialog.style.display = 'none';
                                    userInput.value = '';
                                    fetchAndDisplayData(); // 刷新数据
                                })
                                .catch(error => console.error('Error:', error));
                            } else {
                                alert('请输入内容');
                            }
                        };
                    };
                }
            });

            calendarBody.addEventListener('mouseout', (event) => {//悬浮框消失
                if (event.target.tagName === 'TD') {
                    tooltip.style.display = 'none';
                }
            });

            tooltip.addEventListener('mouseover', () => {
                tooltip.style.display = 'block';
            });

            tooltip.addEventListener('mouseout', () => {//悬浮框消失    
                tooltip.style.display = 'none';
            });

            closeButton.addEventListener('click', () => {//关闭对话框   
                if (userInput.value) {
                    if (confirm('您有未保存的内容，确定要关闭吗？')) {
                        dialog.style.display = 'none';
                        userInput.value = '';
                    }
                } else {
                    dialog.style.display = 'none';
                }
            });
        }
    };

    calendar.init();//初始化日历    

    // 创建并添加“更换皮肤”按钮
    const changeSkinButton = document.createElement('button');
    changeSkinButton.id = 'changeSkinButton';
    changeSkinButton.textContent = '更换背景皮肤';
    document.getElementById('customBorder').appendChild(changeSkinButton);

    // 添加点击事件处理程序
    changeSkinButton.addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageUrl = e.target.result;
                    document.body.style.backgroundImage = `url(${imageUrl})`;
                    localStorage.setItem('backgroundImage', imageUrl); // 保存到 localStorage
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    });
    
    // 加载保存的背景
    const savedBackground = localStorage.getItem('backgroundImage');
    if (savedBackground) {
        document.body.style.backgroundImage = `url(${savedBackground})`;
    }

    // 创建并添加滑动条
    const opacitySlider = document.createElement('input');
    opacitySlider.id = 'opacitySlider';
    opacitySlider.type = 'range';
    opacitySlider.min = 0.3;
    opacitySlider.max = 1;
    opacitySlider.step = 0.01;
    opacitySlider.value = localStorage.getItem('pageOpacity') || 1; // 初始值为保存的透明度或不透明
    document.getElementById('customBorder').appendChild(opacitySlider);

    // 设置初始透明度
    document.body.style.opacity = opacitySlider.value;

    // 添加滑动事件处理程序
    opacitySlider.addEventListener('input', function() {
        document.body.style.opacity = opacitySlider.value;
        localStorage.setItem('pageOpacity', opacitySlider.value); // 保存透明度到 localStorage
    });
});

function editEntry(id, type) {//修改日程和日记      
    const dialog = document.getElementById('dialog');
    const userInput = document.getElementById('userInput');
    const saveButton = document.getElementById('saveButton');
    const closeButton = document.getElementById('closeButton');

    dialog.style.display = 'block';
    userInput.value = ''; // 清空输入框

    saveButton.onclick = function() { // 修改日程和日记
        const content = userInput.value;
        if (content) {
            const url = `/edit_${type}`; // 动态选择 URL
            const selectedCell = document.querySelector('.current-day'); // 确保选择正确的单元格
            if (!selectedCell) {//如果单元格不存在  
                console.error('Selected cell not found');//错误信息
                return;
            }

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id, // 传递条目的 ID
                    newValue: content // 传递新的内容
                })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                dialog.style.display = 'none';
                userInput.value = '';
                fetchAndDisplayData(); // 刷新数据
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert('请输入内容');
        }
    };

    closeButton.onclick = function() {
        dialog.style.display = 'none';
    };
}

function deleteEntry(id, type) { // 删除日程和日记    
    if (confirm("确定要删除吗？")) {
        fetch(`/delete_${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchAndDisplayData(); // 重新获取数据
        })
        .catch(error => console.error('Error:', error));
    }
}

function fetchAndDisplayData() { // 获取日程和日记    
    fetch('/get_schedules')
        .then(response => response.json())
        .then(schedules => {
            const scheduleContainer = document.getElementById('scheduleContainer');
            scheduleContainer.innerHTML = schedules.map(schedule => `
                <tr onclick="toggleDetails(this)">
                    <td>${schedule.id}</td>
                    <td>${formatDate(schedule.date)}</td>
                </tr>
                <tr class="details" style="display: none;">
                    <td class="small-header">内容</td>
                    <td>${schedule.event}</td>
                </tr>
                <tr class="details" style="display: none;">
                    <td class="small-header">创建日期</td>
                    <td>${formatDate(schedule.created_at)}</td>
                </tr>
                <tr class="details" style="display: none;">
                    <td colspan="2">
                        <button onclick="editEntry(${schedule.id}, 'schedule')">修改</button>
                        <button onclick="deleteEntry(${schedule.id}, 'schedule')">删除</button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => console.error('Error fetching schedules:', error));

    fetch('/get_diaries') // 获取日记     
        .then(response => response.json())
        .then(diaries => {
            const diaryContainer = document.getElementById('diaryContainer');
            diaryContainer.innerHTML = diaries.map(diary => `
                <tr onclick="toggleDetails(this)">
                    <td>${diary.id}</td>
                    <td>${formatDate(diary.date)}</td>
                </tr>
                <tr class="details" style="display: none;">
                    <td class="small-header">内容</td>
                    <td>${diary.content}</td>
                </tr>
                <tr class="details" style="display: none;">
                    <td class="small-header">创建日期</td>
                    <td>${formatDate(diary.created_at)}</td>
                </tr>
                <tr class="details" style="display: none;">
                    <td colspan="2">
                        <button onclick="editEntry(${diary.id}, 'diary')">修改</button>
                        <button onclick="deleteEntry(${diary.id}, 'diary')">删除</button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => console.error('Error fetching diaries:', error));
}

function formatDate(dateString) {//格式化日期
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

function toggleDetails(row) {//显示日程和日记的详细内容 
    let nextRow = row.nextElementSibling;
    while (nextRow && nextRow.classList.contains('details')) {
        nextRow.style.display = nextRow.style.display === 'none' ? 'table-row' : 'none';
        nextRow = nextRow.nextElementSibling;
    }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayData);