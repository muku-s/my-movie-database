// ====================
// Supabase接続
// ====================

const SUPABASE_URL = "https://ehwimuxrzytkwacnrcay.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_k8ofYICStjAsHmAGQIBNYQ_s-_jgcGR";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

// ====================
// 映画の並び替え
// ====================

let currentSort = "newest";


function sortMovieList(movieList) {

    const sorted =
        [...movieList];


    sorted.sort(function(a, b) {

        switch (currentSort) {

            // --------------------
            // 登録順（新しい順）
            // --------------------

            case "newest":

                return Number(b.id) - Number(a.id);


            // --------------------
            // 登録順（古い順）
            // --------------------

            case "oldest":

                return Number(a.id) - Number(b.id);


            // --------------------
            // 制作国順
            // --------------------

            case "country":

                return (a.country || "")
                    .localeCompare(
                        b.country || "",
                        "ja"
                    );


            // --------------------
            // 鑑賞日（新しい順）
            // --------------------

            case "date-newest":

                if (!a.date && !b.date) {
                    return 0;
                }

                if (!a.date) {
                    return 1;
                }

                if (!b.date) {
                    return -1;
                }

                return b.date.localeCompare(
                    a.date
                );


            // --------------------
            // 鑑賞日（古い順）
            // --------------------

            case "date-oldest":

                if (!a.date && !b.date) {
                    return 0;
                }

                if (!a.date) {
                    return 1;
                }

                if (!b.date) {
                    return -1;
                }

                return a.date.localeCompare(
                    b.date
                );


            // --------------------
            // 監督順
            // --------------------

            case "director":

                return (a.director || "")
                    .localeCompare(
                        b.director || "",
                        "ja"
                    );


            // --------------------
            // 公開年（新しい順）
            // --------------------

            case "year-newest":

                return (
                    Number(b.year) ||
                    0
                ) - (
                    Number(a.year) ||
                    0
                );


            // --------------------
            // 公開年（古い順）
            // --------------------

            case "year-oldest":

                return (
                    Number(a.year) ||
                    9999
                ) - (
                    Number(b.year) ||
                    9999
                );


            // --------------------
            // 評価順
            // --------------------

            case "rating":

                return (
                    Number(b.rating) ||
                    0
                ) - (
                    Number(a.rating) ||
                    0
                );


            default:

                return Number(b.id) -
                       Number(a.id);

        }

    });


    return sorted;

}


function changeSort(sortType) {

    currentSort =
        sortType;


    displayMovies(
        movies
    );

}


// ====================
// グラフ
// ====================

let directorChart = null;
let countryChart = null;
let decadeChart = null;


// ====================
// データ保存
// ====================

function saveMovies() {

    localStorage.setItem(
        "movies",
        JSON.stringify(movies)
    );

}


// ====================
// 画像をData URLに変換
// ====================

function imageToDataURL(file) {

    return new Promise(function(resolve, reject) {

        if (!file) {

            resolve("");

            return;

        }

        const reader =
            new FileReader();

        reader.onload = function() {

            resolve(
                reader.result
            );

        };

        reader.onerror = function() {

            reject(
                reader.error
            );

        };

        reader.readAsDataURL(file);

    });

}
// ====================
// ポスターをSupabase Storageへアップロード
// ====================

async function uploadPoster(file) {

    if (!file) {

        return "";

    }


    // ファイル名が重複しないようにする

    const extension =
        file.name
            .split(".")
            .pop();


    const fileName =
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2) +
        "." +
        extension;


    const filePath =
        fileName;


    // Storageへアップロード

    const {
        error
    } = await supabaseClient
        .storage
        .from("movie-posters")
        .upload(
            filePath,
            file
        );


    if (error) {

        console.error(
            "ポスターアップロードエラー:",
            error
        );

        throw error;

    }


return filePath;
}

// ====================
// 映画登録
// ====================

// ====================
// 映画登録
// ====================

async function addMovie() {

    const title =
        document
            .getElementById("movieTitle")
            .value
            .trim();

    const director =
        document
            .getElementById("movieDirector")
            .value
            .trim();

    const year =
        document
            .getElementById("movieYear")
            .value;

    const country =
        document
            .getElementById("movieCountry")
            .value
            .trim();

const dateValue =
    document
        .getElementById("movieDate")
        .value;

const date =
    dateValue === ""
        ? null
        : dateValue;

const ratingValue =
    document
        .getElementById("movieRating")
        .value;

const rating =
    ratingValue === ""
        ? null
        : Number(ratingValue);

    const genre =
        document
            .getElementById("movieGenre")
            .value
            .trim();

    const cast =
        document
            .getElementById("movieCast")
            .value
            .trim();

    const tags =
        document
            .getElementById("movieTags")
            .value
            .trim();

    const memo =
        document
            .getElementById("movieMemo")
            .value
            .trim();

    const posterFile =
        document
            .getElementById("moviePoster")
            .files[0];


    // --------------------
    // 作品名チェック
    // --------------------

    if (!title) {

        alert(
            "作品名を入力してください。"
        );

        return;

    }


    // --------------------
    // ポスター画像
    // --------------------

const poster =
    await uploadPoster(
        posterFile
    );


    // --------------------
    // Supabaseへ登録
    // --------------------

    const {
        data,
        error
    } = await supabaseClient
        .from("movies")
        .insert({

            title: title,

            director: director,

            year: year,

            country: country,

            date: date,

            rating: rating,

            genre: genre,

            cast: cast,

            tags: tags,

            memo: memo,

            poster: poster

        })
        .select()
        .single();


    // --------------------
    // エラー処理
    // --------------------

    if (error) {

        console.error(
            "映画登録エラー:",
            error
        );

        alert(
            "映画を登録できませんでした。\n\n" +
            error.message
        );

        return;

    }


    // --------------------
    // 画面を更新
    // --------------------

    movies.unshift(data);


    clearForm();

    updateFilters();

    displayMovies(movies);

    updateStatistics();


    alert(
        "映画を登録しました！"
    );

}


// ====================
// フォームをクリア
// ====================

function clearForm() {

    document
        .getElementById("movieTitle")
        .value = "";


    document
        .getElementById("movieDirector")
        .value = "";


    document
        .getElementById("movieYear")
        .value = "";


    document
        .getElementById("movieCountry")
        .value = "";


    document
        .getElementById("movieDate")
        .value = "";


    document
        .getElementById("movieRating")
        .value = "";


    document
        .getElementById("movieGenre")
        .value = "";


    document
        .getElementById("movieCast")
        .value = "";


    document
        .getElementById("movieTags")
        .value = "";


    document
        .getElementById("moviePoster")
        .value = "";


    document
        .getElementById("movieMemo")
        .value = "";

}


// ====================
// 映画一覧表示
// ====================
async function getPosterUrl(posterPath) {

    if (!posterPath) {
        return "";
    }

    // 古い公開URLが保存されている場合にも対応
    let filePath = posterPath;

    try {

        if (
            posterPath.startsWith("http://") ||
            posterPath.startsWith("https://")
        ) {

            const posterUrl =
                new URL(posterPath);

            const pathPrefix =
                "/storage/v1/object/public/movie-posters/";

            const pathname =
                posterUrl.pathname;

            const index =
                pathname.indexOf(pathPrefix);

            if (index !== -1) {

                filePath =
                    decodeURIComponent(
                        pathname.substring(
                            index +
                            pathPrefix.length
                        )
                    );

            }

        }

    } catch (error) {

        console.error(
            "ポスターURLの処理エラー:",
            error
        );

        return "";

    }

    const {
        data,
        error
    } =
        await supabaseClient
            .storage
            .from("movie-posters")
            .createSignedUrl(
                filePath,
                3600
            );

    if (error) {

        console.error(
            "ポスターURL取得エラー:",
            error
        );

        return "";

    }

    return data.signedUrl;

}
async function displayMovies(movieList) {

    const container =
        document.getElementById(
async function displayMovies(movieList) {

    movieList =
        sortMovieList(
            movieList
        );


    const container =
        document.getElementById(
            "movieContainer"
        );


    container.innerHTML = "";


    document.getElementById(
        "movieCount"
    ).textContent =
        movieList.length + "作品";


    if (movieList.length === 0) {

        container.innerHTML =
            "<p>該当する映画がありません。</p>";

        return;

    }


    for (const movie of movieList) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "movie-card";


        // --------------------
        // ポスターURLを取得
        // --------------------

let detailPosterUrl = "";

if (movie.poster) {

    detailPosterUrl =
        await getPosterUrl(
            movie.poster
        );

}


const posterHTML =
    detailPosterUrl

        ? `
            <img
                src="${detailPosterUrl}"
                class="detail-poster"
            >
          `

        : `
            <div
                class="detail-poster"
            ></div>
          `;


        const stars =
            movie.rating

                ? "★".repeat(
                    Number(movie.rating)
                  )

                : "";


        card.innerHTML = `

            ${posterHTML}

            <div
                class="movie-card-content"
            >

                <h3>
                    ${escapeHTML(
                        movie.title
                    )}
                </h3>


                <div
                    class="movie-info"
                >

                    監督：
                    ${escapeHTML(
                        movie.director ||
                        "未登録"
                    )}

                    <br>

                    公開年：
                    ${escapeHTML(
                        movie.year ||
                        "未登録"
                    )}

                    <br>

                    制作国：
                    ${escapeHTML(
                        movie.country ||
                        "未登録"
                    )}

                </div>


                <div
                    class="movie-rating"
                >

                    ${stars}

                </div>

            </div>

        `;


        card.addEventListener(
            "click",
            function() {

                openMovieDetail(
                    movie.id
                );

            }
        );


        container.appendChild(
            card
        );

    }

}


// ====================
// 詳細画面
// ====================

async function openMovieDetail(id) {

    const movie =
        movies.find(function(movie) {

            return movie.id === id;

        });


    if (!movie) {

        return;

    }


    const detail =
        document.getElementById(
            "movieDetail"
        );

let detailPosterUrl = "";

if (movie.poster) {

    detailPosterUrl =
        await getPosterUrl(
            movie.poster
        );

}
const posterHTML =
    detailPosterUrl

        ? `
            <img
                src="${detailPosterUrl}"
                class="detail-poster"
            >
          `

        : `
            <div
                class="detail-poster"
            ></div>
          `;


    const stars =
        movie.rating

            ? "★".repeat(
                Number(movie.rating)
              )

            : "評価なし";


    detail.innerHTML = `

        <div
            class="detail-layout"
        >

            ${posterHTML}


            <div
                class="detail-info"
            >

                <h2>
                    ${escapeHTML(
                        movie.title
                    )}
                </h2>


                <p>

                    <strong>
                        監督：
                    </strong>

                    ${escapeHTML(
                        movie.director ||
                        "未登録"
                    )}

                </p>


                <p>

                    <strong>
                        公開年：
                    </strong>

                    ${escapeHTML(
                        movie.year ||
                        "未登録"
                    )}

                </p>


                <p>

                    <strong>
                        制作国：
                    </strong>

                    ${escapeHTML(
                        movie.country ||
                        "未登録"
                    )}

                </p>


                <p>

                    <strong>
                        ジャンル：
                    </strong>

                    ${escapeHTML(
                        movie.genre ||
                        "未登録"
                    )}

                </p>


                <p>

                    <strong>
                        出演者：
                    </strong>

                    ${escapeHTML(
                        movie.cast ||
                        "未登録"
                    )}

                </p>


                <p>

                    <strong>
                        タグ：
                    </strong>

                    ${escapeHTML(
                        movie.tags ||
                        "なし"
                    )}

                </p>


                <p>

                    <strong>
                        鑑賞日：
                    </strong>

                    ${escapeHTML(
                        movie.date ||
                        "未登録"
                    )}

                </p>


                <p>

                    <strong>
                        評価：
                    </strong>

                    ${stars}

                </p>

            </div>

        </div>


        <div
            class="detail-memo"
        >

            <h3>
                感想・メモ
            </h3>


            ${escapeHTML(
                movie.memo ||
                "メモはありません。"
            )}

        </div>


        <button
            class="edit-button"
            onclick="openEditModal(
                ${movie.id}
            )"
        >
            編集
        </button>


        <button
            class="delete-button"
            onclick="deleteMovie(
                ${movie.id}
            )"
        >
            削除
        </button>

    `;


    document.getElementById(
        "movieModal"
    ).style.display =
        "block";

}


// ====================
// 詳細画面を閉じる
// ====================

function closeMovieModal() {

    document.getElementById(
        "movieModal"
    ).style.display =
        "none";

}


// ====================
// 編集画面
// ====================

function openEditModal(id) {

    const movie =
        movies.find(function(movie) {

            return movie.id === id;

        });


    if (!movie) {

        return;

    }


    editingMovieId = id;


    document.getElementById(
        "editTitle"
    ).value =
        movie.title;


    document.getElementById(
        "editDirector"
    ).value =
        movie.director || "";


    document.getElementById(
        "editYear"
    ).value =
        movie.year || "";


    document.getElementById(
        "editCountry"
    ).value =
        movie.country || "";


    document.getElementById(
        "editDate"
    ).value =
        movie.date || "";


    document.getElementById(
        "editRating"
    ).value =
        movie.rating || "";


    document.getElementById(
        "editGenre"
    ).value =
        movie.genre || "";


    document.getElementById(
        "editCast"
    ).value =
        movie.cast || "";


    document.getElementById(
        "editTags"
    ).value =
        movie.tags || "";


    document.getElementById(
        "editMemo"
    ).value =
        movie.memo || "";


    document.getElementById(
        "editPoster"
    ).value =
        "";


    document.getElementById(
        "editModal"
    ).style.display =
        "block";

}


// ====================
// 編集保存
// ====================

// ====================
// 編集保存
// ====================

async function saveEdit() {

    const title =
        document
            .getElementById("editTitle")
            .value
            .trim();


    if (!title) {

        alert(
            "作品名を入力してください。"
        );

        return;

    }


    // --------------------
    // 入力内容を取得
    // --------------------

    const director =
        document
            .getElementById("editDirector")
            .value
            .trim();


    const year =
        document
            .getElementById("editYear")
            .value;


    const country =
        document
            .getElementById("editCountry")
            .value
            .trim();


const dateValue =
    document
        .getElementById("editDate")
        .value;

const date =
    dateValue === ""
        ? null
        : dateValue;


const ratingValue =
    document
        .getElementById("editRating")
        .value;

const rating =
    ratingValue === ""
        ? null
        : Number(ratingValue);


    const genre =
        document
            .getElementById("editGenre")
            .value
            .trim();


    const cast =
        document
            .getElementById("editCast")
            .value
            .trim();


    const tags =
        document
            .getElementById("editTags")
            .value
            .trim();


    const memo =
        document
            .getElementById("editMemo")
            .value
            .trim();


    // --------------------
    // ポスター
    // --------------------

    const posterFile =
        document
            .getElementById("editPoster")
            .files[0];


let poster = null;


if (posterFile) {

    poster =
        await uploadPoster(
            posterFile
        );

}


    // --------------------
    // Supabaseへ保存
    // --------------------

    const updateData = {

        title: title,

        director: director,

        year: year,

        country: country,

        date: date,

        rating: rating,

        genre: genre,

        cast: cast,

        tags: tags,

        memo: memo

    };


    // ポスターを変更した場合だけ更新

if (posterFile) {

    // --------------------
    // 古いポスターをStorageから削除
    // --------------------

    if (editingMovieId) {

        const oldMovie =
            movies.find(function(movie) {

                return movie.id === editingMovieId;

            });


        if (
            oldMovie &&
            oldMovie.poster
        ) {

            try {

                let oldFilePath =
                    oldMovie.poster;


                // 古い公開URL形式にも対応

                if (
                    oldMovie.poster.startsWith("http://") ||
                    oldMovie.poster.startsWith("https://")
                ) {

                    const oldPosterUrl =
                        new URL(
                            oldMovie.poster
                        );

                    const pathPrefix =
                        "/storage/v1/object/public/movie-posters/";

                    const pathname =
                        oldPosterUrl.pathname;

                    const index =
                        pathname.indexOf(
                            pathPrefix
                        );

                    if (index !== -1) {

                        oldFilePath =
                            decodeURIComponent(
                                pathname.substring(
                                    index +
                                    pathPrefix.length
                                )
                            );

                    }

                }


                const {
                    error:
                        oldPosterDeleteError
                } =
                    await supabaseClient
                        .storage
                        .from("movie-posters")
                        .remove([
                            oldFilePath
                        ]);


                if (
                    oldPosterDeleteError
                ) {

                    console.error(
                        "古いポスター削除エラー:",
                        oldPosterDeleteError
                    );

                }

            } catch (error) {

                console.error(
                    "古いポスター削除処理エラー:",
                    error
                );

            }

        }

    }


    // 新しいポスターを保存

    updateData.poster =
        poster;

}


    const {
        data,
        error
    } = await supabaseClient
        .from("movies")
        .update(updateData)
        .eq("id", editingMovieId)
        .select()
        .single();


    // --------------------
    // エラー処理
    // --------------------

    if (error) {

        console.error(
            "映画編集エラー:",
            error
        );

        alert(
            "変更を保存できませんでした。\n\n" +
            error.message
        );

        return;

    }


    // --------------------
    // ローカルの表示も更新
    // --------------------

    const index =
        movies.findIndex(
            function(movie) {

                return movie.id === editingMovieId;

            }
        );


    if (index !== -1) {

        movies[index] =
            data;

    }


    // --------------------
    // 画面更新
    // --------------------

    updateFilters();

    displayMovies(movies);

    updateStatistics();

    closeEditModal();

    closeMovieModal();


    alert(
        "変更を保存しました！"
    );

}


// ====================
// 編集画面を閉じる
// ====================

function closeEditModal() {

    document.getElementById(
        "editModal"
    ).style.display =
        "none";

}


// ====================
// 映画削除
// ====================

// ====================
// 映画削除
// ====================

async function deleteMovie(id) {

    if (
        !confirm(
            "この映画を削除しますか？"
        )
    ) {

        return;

    }


    // --------------------
    // 削除する映画を取得
    // --------------------

    const movie =
        movies.find(function(movie) {

            return movie.id === id;

        });


    if (!movie) {

        return;

    }


    // --------------------
    // ポスターをStorageから削除
    // --------------------

 if (movie.poster) {

    try {

        let filePath =
            movie.poster;


        // 古い公開URLが保存されている場合に対応

        if (
            movie.poster.startsWith("http://") ||
            movie.poster.startsWith("https://")
        ) {

            const posterUrl =
                new URL(movie.poster);

            const pathPrefix =
                "/storage/v1/object/public/movie-posters/";

            const pathname =
                posterUrl.pathname;

            const index =
                pathname.indexOf(
                    pathPrefix
                );

            if (index !== -1) {

                filePath =
                    decodeURIComponent(
                        pathname.substring(
                            index +
                            pathPrefix.length
                        )
                    );

            }

        }


        const {
            error:
                storageError
        } =
            await supabaseClient
                .storage
                .from("movie-posters")
                .remove([
                    filePath
                ]);


        if (storageError) {

            console.error(
                "ポスター削除エラー:",
                storageError
            );

        }

    } catch (error) {

        console.error(
            "ポスター削除処理エラー:",
            error
        );

    }

}


    // --------------------
    // moviesテーブルから削除
    // --------------------

    const {
        error
    } =
        await supabaseClient
            .from("movies")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "映画削除エラー:",
            error
        );

        alert(
            "映画を削除できませんでした。\n\n" +
            error.message
        );

        return;

    }


    // --------------------
    // ローカル表示を更新
    // --------------------

    movies =
        movies.filter(function(movie) {

            return movie.id !== id;

        });


    updateFilters();

    displayMovies(movies);

    updateStatistics();

    closeMovieModal();


    alert(
        "映画を削除しました！"
    );

}


// ====================
// 映画検索
// ====================

function searchMovies() {

    const titleKeyword =
        document
            .getElementById(
                "searchTitle"
            )
            .value
            .trim()
            .toLowerCase();


    const director =
        document.getElementById(
            "searchDirector"
        ).value;


    const country =
        document.getElementById(
            "searchCountry"
        ).value;


    // 公開年の範囲

    const yearFromValue =
        document.getElementById(
            "searchYearFrom"
        ).value;


    const yearToValue =
        document.getElementById(
            "searchYearTo"
        ).value;


    const yearFrom =
        yearFromValue === ""
            ? null
            : Number(yearFromValue);


    const yearTo =
        yearToValue === ""
            ? null
            : Number(yearToValue);


    const genre =
        document.getElementById(
            "searchGenre"
        ).value;


    const tag =
        document.getElementById(
            "searchTag"
        ).value;


    // 開始年が終了年より大きい場合

    if (
        yearFrom !== null &&
        yearTo !== null &&
        yearFrom > yearTo
    ) {

        alert(
            "公開年の範囲が正しくありません。\n開始年は終了年以下にしてください。"
        );

        return;

    }


    const results =
        movies.filter(function(movie) {


            // --------------------
            // 作品名・監督
            // --------------------

            const titleMatch =

                titleKeyword === "" ||

                (movie.title || "")
                    .toLowerCase()
                    .includes(
                        titleKeyword
                    ) ||

                (movie.director || "")
                    .toLowerCase()
                    .includes(
                        titleKeyword
                    );


            // --------------------
            // 監督
            // --------------------

            const directorMatch =

                director === "" ||

                movie.director === director;


            // --------------------
            // 制作国
            // --------------------

            const countryMatch =

                country === "" ||

                movie.country === country;


            // --------------------
            // 公開年
            // --------------------

            const movieYear =
                Number(movie.year);


            const yearMatch =

                movie.year === "" ||

                movie.year === null ||

                movie.year === undefined ||

                (
                    (yearFrom === null ||
                        movieYear >= yearFrom) &&

                    (yearTo === null ||
                        movieYear <= yearTo)
                );


            // --------------------
            // ジャンル
            // --------------------

            const genreMatch =

                genre === "" ||

                (movie.genre || "")
                    .split(",")
                    .map(function(item) {

                        return item.trim();

                    })
                    .includes(
                        genre
                    );


            // --------------------
            // タグ
            // --------------------

            const tagMatch =

                tag === "" ||

                (movie.tags || "")
                    .split(",")
                    .map(function(item) {

                        return item.trim();

                    })
                    .includes(
                        tag
                    );


            return (

                titleMatch &&

                directorMatch &&

                countryMatch &&

                yearMatch &&

                genreMatch &&

                tagMatch

            );

        });


    displayMovies(results);

}


// ====================
// 検索リセット
// ====================

function resetSearch() {

    document.getElementById(
        "searchTitle"
    ).value = "";


    document.getElementById(
        "searchDirector"
    ).value = "";


    document.getElementById(
        "searchCountry"
    ).value = "";


    document.getElementById(
        "searchYearFrom"
    ).value = "";


    document.getElementById(
        "searchYearTo"
    ).value = "";


    document.getElementById(
        "searchGenre"
    ).value = "";


    document.getElementById(
        "searchTag"
    ).value = "";


    displayMovies(movies);

}


// ====================
// 検索項目更新
// ====================

function updateFilters() {

    const directorSelect =
        document.getElementById(
            "searchDirector"
        );


    const countrySelect =
        document.getElementById(
            "searchCountry"
        );


    const genreSelect =
        document.getElementById(
            "searchGenre"
        );


    const tagSelect =
        document.getElementById(
            "searchTag"
        );


    // --------------------
    // 監督
    // --------------------

    const directors = [

        ...new Set(

            movies

                .map(function(movie) {

                    return movie.director;

                })

                .filter(Boolean)

        )

    ].sort();


    directorSelect.innerHTML =
        '<option value="">すべて</option>';


    directors.forEach(function(director) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            director;


        option.textContent =
            director;


        directorSelect.appendChild(
            option
        );

    });


    // --------------------
    // 制作国
    // --------------------

    const countries = [

        ...new Set(

            movies

                .map(function(movie) {

                    return movie.country;

                })

                .filter(Boolean)

        )

    ].sort();


    countrySelect.innerHTML =
        '<option value="">すべて</option>';


    countries.forEach(function(country) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            country;


        option.textContent =
            country;


        countrySelect.appendChild(
            option
        );

    });


    // --------------------
    // ジャンル
    // --------------------

    const genres = [

        ...new Set(

            movies

                .flatMap(function(movie) {

                    return (
                        movie.genre || ""
                    ).split(",");

                })

                .map(function(genre) {

                    return genre.trim();

                })

                .filter(Boolean)

        )

    ].sort();


    genreSelect.innerHTML =
        '<option value="">すべて</option>';


    genres.forEach(function(genre) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            genre;


        option.textContent =
            genre;


        genreSelect.appendChild(
            option
        );

    });


    // --------------------
    // タグ
    // --------------------

    const tags = [

        ...new Set(

            movies

                .flatMap(function(movie) {

                    return (
                        movie.tags || ""
                    ).split(",");

                })

                .map(function(tag) {

                    return tag.trim();

                })

                .filter(Boolean)

        )

    ].sort();


    tagSelect.innerHTML =
        '<option value="">すべて</option>';


    tags.forEach(function(tag) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            tag;


        option.textContent =
            tag;


        tagSelect.appendChild(
            option
        );

    });

}


// ====================
// HTMLを安全に表示
// ====================

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==================================================
// 統計機能
// ==================================================


// ====================
// データ集計
// ====================

function countMoviesBy(items) {

    const counts = {};


    items.forEach(function(item) {

        if (!item) {

            return;

        }


        counts[item] =
            (counts[item] || 0) + 1;

    });


    return counts;

}


// ====================
// 公開年から年代を取得
// ====================

function getDecade(year) {

    const number =
        Number(year);


    if (
        !number ||
        isNaN(number)
    ) {

        return null;

    }


    return Math.floor(
        number / 10
    ) * 10;

}


// ====================
// 統計グラフ更新
// ====================

function updateStatistics() {


    // ====================
    // 監督
    // ====================

    const directorCounts =
        countMoviesBy(

            movies.map(function(movie) {

                return movie.director;

            })

        );


    // ====================
    // 制作国
    // ====================

    const countryCounts =
        countMoviesBy(

            movies.map(function(movie) {

                return movie.country;

            })

        );


    // ====================
    // 公開年代
    // ====================

    const decades =

        movies

            .map(function(movie) {

                return getDecade(
                    movie.year
                );

            })

            .filter(function(decade) {

                return decade !== null;

            });


    const decadeCounts =
        countMoviesBy(
            decades
        );


    // ====================
    // 監督グラフ
    // ====================

    const directorCanvas =
        document.getElementById(
            "directorChart"
        );


    if (!directorCanvas) {

        return;

    }


    if (directorChart) {

        directorChart.destroy();

    }


    const directorLabels =
        Object.keys(
            directorCounts
        );


    const directorData =
        Object.values(
            directorCounts
        );


    directorChart =
        new Chart(
            directorCanvas,
            {

                type: "bar",

                data: {

                    labels:
                        directorLabels,

                    datasets: [

                        {

                            label:
                                "鑑賞本数",

                            data:
                                directorData

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                stepSize: 1

                            }

                        }

                    }

                }

            }
        );


    // ====================
    // 制作国グラフ
    // ====================

    const countryCanvas =
        document.getElementById(
            "countryChart"
        );


    if (countryChart) {

        countryChart.destroy();

    }


    const countryLabels =
        Object.keys(
            countryCounts
        );


    const countryData =
        Object.values(
            countryCounts
        );


    countryChart =
        new Chart(
            countryCanvas,
            {

                type: "bar",

                data: {

                    labels:
                        countryLabels,

                    datasets: [

                        {

                            label:
                                "鑑賞本数",

                            data:
                                countryData

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                stepSize: 1

                            }

                        }

                    }

                }

            }
        );


    // ====================
    // 公開年代グラフ
    // ====================

    const decadeCanvas =
        document.getElementById(
            "yearChart"
        );


    if (decadeChart) {

        decadeChart.destroy();

    }


    if (!decadeCanvas) {

        return;

    }


    const sortedDecades =

        Object.keys(
            decadeCounts
        )

        .map(Number)

        .sort(function(a, b) {

            return a - b;

        });


    const decadeLabels =

        sortedDecades.map(
            function(decade) {

                return (
                    decade +
                    "年代"
                );

            }
        );


    const decadeData =

        sortedDecades.map(
            function(decade) {

                return (
                    decadeCounts[decade]
                );

            }
        );


    decadeChart =
        new Chart(
            decadeCanvas,
            {

                type: "bar",

                data: {

                    labels:
                        decadeLabels,

                    datasets: [

                        {

                            label:
                                "鑑賞本数",

                            data:
                                decadeData

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                stepSize: 1

                            }

                        }

                    }

                }

            }
        );

}


// ====================
// アプリ起動
// ====================

updateFilters();

displayMovies(movies);

updateStatistics();
// ====================
// Supabase接続テスト
// ====================

console.log(
    "Supabase接続準備完了",
    supabaseClient
);
// ====================
// ログイン
// ====================

async function login() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;


    const errorElement =
        document.getElementById(
            "loginError"
        );


    errorElement.textContent = "";


    if (!email || !password) {

        errorElement.textContent =
            "メールアドレスとパスワードを入力してください。";

        return;

    }


    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({

        email: email,

        password: password

    });


    if (error) {

        console.error(error);

        errorElement.textContent =
            "ログインできませんでした。メールアドレスとパスワードを確認してください。";

        return;

    }


    console.log(
        "ログイン成功",
        data.user
    );


    document.getElementById(
        "loginScreen"
    ).style.display =
        "none";


    document.getElementById(
        "appContent"
    ).style.display =
        "block";
loadMovies();
}
async function logout() {

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {

        console.error(
            "ログアウトエラー:",
            error
        );

        alert(
            "ログアウトできませんでした。"
        );

        return;

    }

    document.getElementById(
        "appContent"
    ).style.display = "none";

    document.getElementById(
        "loginScreen"
    ).style.display = "block";

}
// ====================
// ログイン状態を確認
// ====================

async function checkLogin() {

    const {
        data
    } = await supabaseClient.auth.getSession();


if (data.session) {

    document.getElementById(
        "loginScreen"
    ).style.display =
        "none";


    document.getElementById(
        "appContent"
    ).style.display =
        "block";


    loadMovies();

}

}


// ====================
// 起動時にログイン確認
// ====================

checkLogin();
// ====================
// Supabaseから映画を取得
// ====================

async function loadMovies() {

    const {
        data,
        error
    } = await supabaseClient
        .from("movies")
        .select("*")
        .order("id", {
            ascending: false
        });


    if (error) {

        console.error(
            "映画データの取得に失敗しました。",
            error
        );

        alert(
            "映画データを取得できませんでした。"
        );

        return;

    }


    movies = data || [];


    updateFilters();

    displayMovies(movies);

    updateStatistics();

}