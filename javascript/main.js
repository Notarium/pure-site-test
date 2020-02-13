'use strict';
const _DEBUG = true;
const dummy = elm("dummy");
const title = elm("title-line");

const subOverlay = elm("overlay");
const dateTable = elm("date-table");
const overlaytext = elm("overlay-text");
const dayOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const token = getUrlVars().userToken;
let currentSelectedDate;

const FETCH_PATH = _DEBUG ? "https://painting.kasora.moe/api/v1/class" : "/api/v1/class";

console.log(token);

if (token == undefined) {
    title.innerText = "查看中";
} else {
    title.innerText = "小画家，该选课了";
}

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
dummy.style.display = "none";
//showSubmitOverlay();
hideSubmitOverlay();
document.addEventListener("click", (ev) => {
    if (ev.srcElement.tagName === "BUTTON"
        && ev.srcElement.classList.contains("btn-slot")) {
        let obj = JSON.parse(ev.srcElement.value);
        if (obj.free === true) {
            if (token == undefined) {
                return;
            }

            showSubmitOverlay(true, obj.date);
        }
        else {
            if (token == undefined) {
                dummy.style.display = "inline";
                dummy.value = obj.user.toString();
                dummy.select();
                document.execCommand("copy");
                dummy.style.display = "none";
                alert("已复制QQ号");
            } else {

                showSubmitOverlay(false, obj.date);
            }
        }
    }
});
refresh();


function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
function showSubmitOverlay(act, datestr) {
    subOverlay.style.display = "block";
    let date = new Date(datestr);
    currentSelectedDate = date;
    let hintText = act ? "确认选择" : "确认取消";
    overlaytext.innerText = `${hintText} [${date.getMonth()}月${date.getDate()}日${dayOfWeek[date.getDay()]}][${date.getHours()}点]吗？`;
}
function hideSubmitOverlay() {
    subOverlay.style.display = "none";
}
function OverlayToggle() {
    console.log(subOverlay.style.display);
    if (subOverlay.style.display == "none") {
        showSubmitOverlay();
    } else {
        hideSubmitOverlay();
    }
}
function elm(name) {
    return document.getElementById(name);
}
function refresh() {
    fetch(FETCH_PATH).then(res => {
        console.log(res);
        console.log(res.body);
        return res.json()
    }).then(j => {
        console.log(j);
        let i = new Date(j.data.startDate);
        i.setHours(0, 0, 0);
        let endD = new Date(j.data.endDate)
        endD.setHours(23, 0, 0);
        dateTable.innerText = "";
        while (i <= endD) {

            let tr = ce("tr");
            let th = ce("th");
            th.scope = "row";
            th.innerText = `${i.getMonth()}-${i.getDate()}-${dayOfWeek[i.getDay()]}`
            tr.appendChild(th);
            let td = ce("td");
            let arr = ce("div");
            tr.appendChild(td);
            td.appendChild(arr);
            let q = i;

            for (let idx = 10; idx <= 22; idx += 2) {
                q.setHours(idx);
                let checkRslt = check(j, q);
                if (checkRslt.result) {
                    arr.appendChild(btn(["btn", "btn-warning", "btn-slot"],
                        idx.toString() + ":00" + "\n" + checkRslt.data.userId,
                        JSON.stringify({ free: false, date: q, user: checkRslt.data.userId })));
                } else {
                    arr.appendChild(btn(["btn", "btn-success", "btn-slot"],
                        idx.toString() + ":00" + "\n\n",
                        JSON.stringify({ free: true, date: q })));
                }
            }
            dateTable.appendChild(tr);
            i = i.addDays(1);
        }
    });
}
function check(json, time) {
    let cl = json.data.classList;
    for (let c of cl) {
        let cdt = new Date(c.date);
        if (cdt.valueOf() == time.valueOf()) {
            //usrName = c.userInfo;
            return {
                result: true,
                data: c.userInfo,
            };
        }
    }
    return { result: false };
}
function btn(classArr, text, value) {
    let bt = document.createElement("button");
    bt.type = "button";
    classArr.forEach(element => {
        bt.classList.add(element)
    });
    bt.innerText = text;
    if (value != null) {
        bt.value = value;
    }
    return bt;
}
function ce(tagName) {
    return document.createElement(tagName);
}
async function submit() {
    hideSubmitOverlay();
    dateTable.innerText = "";
    let tr = ce("tr");
    let th = ce("th");
    th.innerText = "通信中。。。";
    tr.appendChild(th);
    dateTable.appendChild(tr);
    let res = await fetch(FETCH_PATH,
        {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userToken: token,
                date: currentSelectedDate,
            })
        }
    );
    if (!res.ok) {
        dateTable.innerText = "";
        let tr = ce("tr");
        let th = ce("th");
        th.innerText = res.status;
        dateTable.appendChild(tr);
    }
    let rdata = res.json();
    if (rdata.status == "error") {
        dateTable.innerText = "";
        let tr = ce("tr");
        let th = ce("th");
        th.innerText = rdata.message;
        dateTable.appendChild(tr);
    } else {
        refresh();
    }
}
function reset() {
    dateTable.innerHTML = strTemplate;
}
const strTemplate = `<tr>
<th scope="row">1</th>
<td>
    <div>
        <button type="button" class="btn btn-warning">1</button>
        <button type="button" class="btn btn-warning">2</button>
        <button type="button" class="btn btn-warning">3</button>
        <button type="button" class="btn btn-warning">4</button>
    </div>
</td>
</tr>
<tr>
<th scope="row">2</th>
<td>
    <div>
        <button type="button" class="btn btn-warning">1</button>
        <button type="button" class="btn btn-warning">2</button>
        <button type="button" value="enabled" class="btn btn-success">3</button>
        <button type="button" class="btn btn-warning">4</button>
    </div>
</td>
</tr>`;