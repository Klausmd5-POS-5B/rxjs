window.onload = function () {
    const Rx = rxjs;
    const {
        Observable,
        Subject,
        ReplaySubject,
        BehaviorSubject
    } = rxjs;
    const {getJSON} = rxjs.ajax.ajax;
    const {
        buffer,
        connect,
        count,
        debounce,
        debounceTime,
        delay,
        distinct,
        filter,
        flatMap,
        map,
        tap,
    } = rxjs.operators;
    const {ajax} = rxjs.ajax;
    //import { ajax } from 'rxjs/ajax';


    bmi();
    comments();
    parralel();
    autocomplete();

    function println(query, nr, fixed = 0) {
        document.querySelector(query).innerText = parseInt(nr).toFixed(fixed);
    }

    function print(query, x, add = false) {
        if(add) {
            document.querySelector(query).innerHTML += x;
        } else {
            document.querySelector(query).innerHTML = x;
        }
    }

    function bmi() {
        let w = 52;
        let h = 150;

        Rx.fromEvent(document.querySelector('#w_in'), 'input')
            .pipe(
                map(e => e.target.value)
            )
            .subscribe(x => {
                w = x
                println("#b_out_Weight", parseInt(w));
                println("#bmiOut", (w / (Math.pow((h / 100), 2))), 2);
            });

        Rx.fromEvent(document.querySelector('#h_in'), 'input')
            .pipe(
                map(e => e.target.value),
                map(height => height)
            )
            .subscribe(x => {
                h = x
                println("#b_out_Height", (h));
                println("#bmiOut", (w / (Math.pow((h / 100), 2))), 2);
            })
    }

    function fetch2(str) {
        return new Promise((res, rej) => {
            fetch(str)
                .then(x => x.json())
                .then(x => res(x))
                .catch(x => rej(x));
        });
    }

    /*function fetch2(str) {
        return new Promise((res, rej) => {
            ajax.getJSON(str)
                .then(x => res(x))
                .catch(x => rej(x));
        });
    }*/



    async function comment(commentId) {

        // avoid variables :)
        return await fetch2(`https://jsonplaceholder.typicode.com/users/${
            await fetch2(`https://jsonplaceholder.typicode.com/posts/${
                await fetch2(`https://jsonplaceholder.typicode.com/comments/${commentId}`)
                    .then(x => {
                        return x.postId;
                    })
            }`)
                .then(x => {
                    return x.userId;
                })
        }`)
            .then(x => {
                return `Commented by: ${x.username} [${x.name}]`;
            });


        /*return await ajax.getJSON(`https://jsonplaceholder.typicode.com/users/${
            await ajax.getJSON(`https://jsonplaceholder.typicode.com/posts/${ 
                await ajax.getJSON(`https://jsonplaceholder.typicode.com/comments/${commentId}`).pipe(
                    map(x=> {return x.postId})
                ).subscribe()
            }`).pipe(
                map(x=> {return x.userId})
            ).subscribe()
        }`).pipe(
            map(x=> `Commented by: ${x.username} [${x.name}]`)
        ).subscribe()*/

    }

    function comments() {
        Rx.fromEvent(document.querySelector('#cID_in'), 'input')
            .pipe(
                map(e => e.target.value),
                tap(async x => {
                    print("#cID_out", `CommentId ${x}`);
                    print("#cUSer", await comment(x));
                })).subscribe();
    }

    function parralel() {

        Rx.fromEvent(document.querySelector('#in_parallel'), 'input')
            .pipe(
                map(e => 7),
                tap(x => {
                    ajax.getJSON(`https://jsonplaceholder.typicode.com/albums?userId=${x}`).pipe(
                        map(x=>map2("#lst_albums", x))
                    ).subscribe();

                    ajax.getJSON(`https://jsonplaceholder.typicode.com/todos?userId=${x}`).pipe(
                        map(x=>map2("#lst_todos", x))
                    ).subscribe();

                    //fetch2(`https://jsonplaceholder.typicode.com/albums?userId=${x}`).then(x => map2("#lst_albums", x));
                    //fetch2(`https://jsonplaceholder.typicode.com/todos?userId=${x}`).then(x => map2("#lst_todos", x));
                })).subscribe();
    }

    function map2(query, x) {
        x.map(y => `${y.title}`)
            .slice(0, 5)
            .forEach(y => print(query, y));
    }

    function autocomplete() {
        let isActive = false;
        Rx.fromEvent(document.querySelector('#in_start'), 'click')
            .pipe(
                tap(_ => {
                    isActive = !isActive;
                    print("#in_start", isActive ? "Stop" : "Start")
                })).subscribe();


        Rx.fromEvent(document.querySelector('#in_query'), 'input')
            .pipe(
                map(e => e.target.value),

                debounceTime(300),
                tap(name => {
                    if (isActive) {

                        /*ajax.getJSON(`http://localhost:3000/persons`).pipe(
                            map(x => `${x.firstname} ${x.lastname}`)).filter(x => x.trim().toLowerCase().includes(name)).then(x => {
                            print("#lst_persons", "");
                            x.forEach(y => print("#lst_persons", `${y}<br>`, true))
                        }
                        ).subscribe();
*/
                        fetch2(`http://localhost:3000/persons`)
                        .then(x => x.map(x => `${x.firstname} ${x.lastname}`))
                        .then(x => x.filter(x => x.trim().toLowerCase().includes(name)))
                        .then(x => {
                            print("#lst_persons", "");
                            x.forEach(y => print("#lst_persons", `${y}<br>`, true))
                        })
                    }
                })).subscribe();
    }
}

