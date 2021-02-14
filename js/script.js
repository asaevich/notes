let textarea = document.querySelector('textarea')
let dateInput = document.querySelector('input[type="date"]')

let list = document.createElement('div')
list.classList.add('list')
document.body.appendChild(list)

let db;
// IIFE
(async () => {
    // создаем базу данных
    // название, версия...
    db = await idb.openDb('db', 1, db => {
        // создаем хранилище
        db.createObjectStore('notes', {
            keyPath: 'id'
        })
    })

    // формируем список
    createList()
})();

// добавляем к кнопке для добавления заметки обработчик события "клик"
document.querySelector('.add-btn').onclick = addNote

const addNote = async () => {
    // если поле для ввода текста пустое, ничего не делаем
    if (textarea.value === '') return

    // получаем значение этого поля
    let noteValue = textarea.value

    // объявляем переменную для даты напоминания
    // с помощью тернарного оператора
    // присваиваем этой переменной null или значение соответствующего поля
    let date
    dateInput.value === '' ? date = null : date = dateInput.value

    // заметка представляет собой объект
    let note = {
        id: id,
        text: noteValue,
        // дата создания
        createdDate: new Date().toLocaleDateString(),
        // индикатор выполнения
        isCompleted: '',
        // дата напоминания
        notifyDate: date
    }

    // пробуем записать данные в хранилище
    try {
        await db.transaction('notes', 'readwrite')
            .objectStore('notes')
            .add(note)
        // формируем список
        await createList()
            // обнуляем значения полей
            .then(() => {
                textarea.value = ''
                dateInput.value = ''
            })
    } catch { }
}

let id

const createList = async () => {
    // добавляем заголовок
    // дату формируем с помощью API интернационализации
    list.innerHTML = `<h3>Today is ${new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format()}</h3>`

    // получаем заметки из базы данных
    let notes = await db.transaction('notes')
        .objectStore('notes')
        .getAll()

    // массив для дат напоминаний
    let dates = []

    // если в базе имеются данные
    if (notes.length) {
        // присваиваем переменной "id" номер последней заметки
        id = notes.length

        // итерация по массиву
        notes.map(note => {
            // добавляем заметки в список
            list.insertAdjacentHTML('beforeend',
                // добавляем заметке атрибут "data-id"
                `<div class = "note" data-id="${note.id}">
            // дата уведомления
            <span class="notify ${note.notifyDate}">${note.notifyDate}</span>
            // значок (кнопка) отображения уведомления
            // обратите внимание, что в качестве дополнительного класса
            // мы добавляем тексту и значку уведомления дату напоминания
            // если дата не указана
            // текст и значок уведомления не отображаются (CSS: .info.null, .notify.null)
            <span class="info ${note.notifyDate}">?</span>

            // значок (кнопка) выполнения задачи
            <span class="complete">V</span>
            // в качестве класса к тексту заметки добавляется индикатор выполнения
            <p class="${note.completed}">Text: ${note.text}, <br> created: ${note.createdDate}</p>
            // значок (кнопка) удаления заметки
            <span class="delete">X</span>
        </div>`)
            // заполняем массив с датами напоминаний
            // если дата не указана
            if (note.notifyDate === null) {
                return
                // если дата указана
            } else {
                // массив объектов
                dates.push({
                    id: note.id,
                    date: note.notifyDate.replace(/(\d+)-(\d+)-(\d+)/, '$3.$2.$1')
                })
            }
        })
        // если в базе не имеется данных
    } else {
        // присваиваем переменной "id" значение 0
        id = 0

        // выводим в список текст об отсутствии заметок
        list.insertAdjacentHTML('beforeend', '<p class="note">empty</p>')
    }
}