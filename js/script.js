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

// находим все заметки и добавляем к каждой обработчик события "клик"
// мы делаем это внутри функции формирования списка
// поскольку наш список при добавлении/удалении заметки формируется заново
document.querySelectorAll('.note').forEach(note => note.addEventListener('click', event => {
    // если целью клика является элемент с классом "complete" (кнопка выполнения задачи)
    if (event.target.classList.contains('complete')) {
        // добавляем/удаляем у следующего элемента (текст заметки) класс "line-through", отвечающий за зачеркивание текста
        event.target.nextElementSibling.classList.toggle('line-through')

        // меняем значение индикатора выполнения заметки
        // в зависимости от наличия класса "complete"
        note.querySelector('p').classList.contains('line-through')
            ? notes[note.dataset.id].completed = 'line-through'
            : notes[note.dataset.id].completed = ''

        // перезаписываем заметку в хранилище
        db.transaction('notes', 'readwrite')
            .objectStore('notes')
            .put(notes[note.dataset.id])

        // если целью клика является элемент с классом "delete" (кнопка удаления заметки)
    }else if (event.target.classList.contains('delete')) {
        // вызываем соответствующую функцию со значением идентификатора заметки в качестве параметра
        // обратите внимание, что нам необходимо преобразовать id в число
        deleteNote(+note.dataset.id)

        // если целью клика является элемент с классом "info" (кнопка отображения даты напоминания)
    } else if (event.target.classList.contains('info')) {
        // добавляем/удаляем у предыдущего элемента (дата напоминания) класс "show", отвечающий за отображение
        event.target.previousElementSibling.classList.toggle('show')
    }
}))

// запускаем проверку напоминаний
checkDeadline(dates)
