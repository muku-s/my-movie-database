// ==================================================
// Supabase接続
// ==================================================

const SUPABASE_URL =
    "https://ehwimuxrzytkwacnrcay.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_k8ofYICStjAsHmAGQIBNYQ_s-_jgcGR";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ==================================================
// 映画データ
// ==================================================

let movies = [];

let editingMovieId = null;


// ==================================================
// 並び替え
// ==================================================

let currentSort = "newest";


function sortMovieList(movieList) {

    const sorted = [...movieList];

    sorted.sort(function (a, b) {

        switch (currentSort) {

            case "newest":

                return Number(b.id) - Number(a.id);


            case "oldest":

                return Number(a.id) - Number(b.id);


            case "country":

                return String(a.country || "").localeCompare(
                    String(b.country || ""),
                    "ja"
                );


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

                return String(b.date).localeCompare(
                    String(a.date)
                );


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

                return String(a.date).localeCompare(
                    String(b.date)
                );


            case "director":

                return String(a.director || "").localeCompare(
                    String(b.director || ""),
                    "ja"
                );


            case "year-newest":

                return (
                    (Number(b.year) || 0) -
                    (Number(a.year) || 0)
                );


            case "year-oldest":

                return (
                    (Number(a.year) || 9999) -
                    (Number(b.year) || 9999)
                );


            case "rating":

                return (
                    (Number(b.rating) || 0) -
                    (Number(a.rating) || 0)
                );


            default:

                return Number(b.id) - Number(a.id);

        }

    });

    return sorted;
}


function changeSort(sortType) {

    currentSort = sortType;

    displayMovies(movies);
}


// ==================================================
// グラフ
// ==================================================

let directorChart = null;

let countryChart = null;

let decadeChart = null;


// ==================================================
// LocalStorage
// ==================================================

function saveMovies() {

    localStorage.setItem(
        "movies",
        JSON.stringify(movies)
    );

}


// ==================================================
// 画像をData URLに変換
// ==================================================

function imageToDataURL(file) {

    return new Promise(function (resolve, reject) {

        if (!file) {

            resolve("");

            return;

        }

        const reader = new FileReader();

        reader.onload = function () {

            resolve(reader.result);

        };

        reader.onerror = function () {

            reject(reader.error);

        };

        reader.readAsDataURL(file);

    });

}


// ==================================================
// ポスターをSupabase Storageへアップロード
// ==================================================

async function uploadPoster(file) {

    if (!file) {

        return "";

    }

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    const fileName =
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2) +
        "." +
        extension;

    const filePath = fileName;

    const result =
        await supabaseClient
            .storage
            .from("movie-posters")
            .upload(
                filePath,
                file
            );

    if (result.error) {

        console.error(
            "ポスターアップロードエラー:",
            result.error
        );

        throw result.error;

    }

    return filePath;

}


// ==================================================
// 映画登録
// ==================================================

async function addMovie() {

    const titleElement =
        document.getElementById("movieTitle");

    const directorElement =
        document.getElementById("movieDirector");

    const yearElement =
        document.getElementById("movieYear");

    const countryElement =
        document.getElementById("movieCountry");

    const dateElement =
        document.getElementById("movieDate");

    const ratingElement =
        document.getElementById("movieRating");

    const genreElement =
        document.getElementById("movieGenre");

    const castElement =
        document.getElementById("movieCast");

    const tagsElement =
        document.getElementById("movieTags");

    const memoElement =
        document.getElementById("movieMemo");

    const posterElement =
        document.getElementById("moviePoster");


    if (!titleElement) {

        console.error(
            "movieTitleが見つかりません。"
        );

        return;

    }


    const title =
        titleElement.value.trim();

    const director =
        directorElement
            ? directorElement.value.trim()
            : "";

    const year =
        yearElement
            ? yearElement.value
            : "";

    const country =
        countryElement
            ? countryElement.value.trim()
            : "";

    const dateValue =
        dateElement
            ? dateElement.value
            : "";

    const date =
        dateValue === ""
            ? null
            : dateValue;

    const ratingValue =
        ratingElement
            ? ratingElement.value
            : "";

    const rating =
        ratingValue === ""
            ? null
            : Number(ratingValue);

    const genre =
        genreElement
            ? genreElement.value.trim()
            : "";

    const cast =
        castElement
            ? castElement.value.trim()
            : "";

    const tags =
        tagsElement
            ? tagsElement.value.trim()
            : "";

    const memo =
        memoElement
            ? memoElement.value.trim()
            : "";

    const posterFile =
        posterElement &&
        posterElement.files
            ? posterElement.files[0]
            : null;


    if (!title) {

        alert(
            "作品名を入力してください。"
        );

        return;

    }


    // ------------------------------------------
    // ポスターアップロード
    // ------------------------------------------

    let poster = "";

    if (posterFile) {

        try {

            poster =
                await uploadPoster(
                    posterFile
                );

        } catch (error) {

            console.error(error);

            alert(
                "ポスター画像をアップロードできませんでした。"
            );

            return;

        }

    }


    // ------------------------------------------
    // Supabaseへ登録
    // ------------------------------------------

    const result =
        await supabaseClient
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


    if (result.error) {

        console.error(
            "映画登録エラー:",
            result.error
        );

        alert(
            "映画を登録できませんでした。\n\n" +
            result.error.message
        );

        return;

    }


    movies.unshift(
        result.data
    );


    clearForm();

    updateFilters();

    displayMovies(movies);

    updateStatistics();


    alert(
        "映画を登録しました！"
    );

}


// ==================================================
// フォームクリア
// ==================================================

function clearForm() {

    const ids = [

        "movieTitle",
        "movieDirector",
        "movieYear",
        "movieCountry",
        "movieDate",
        "movieRating",
        "movieGenre",
        "movieCast",
        "movieTags",
        "moviePoster",
        "movieMemo"

    ];


    ids.forEach(function (id) {

        const element =
            document.getElementById(id);

        if (!element) {

            return;

        }

        element.value = "";

    });

}


// ==================================================
// ポスターURL取得
// ==================================================

async function getPosterUrl(posterPath) {

    if (!posterPath) {

        return "";

    }


    let filePath =
        posterPath;


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
                            index + pathPrefix.length
                        )
                    );

            }

        }

    } catch (error) {

        console.error(
            "ポスターURL処理エラー:",
            error
        );

        return "";

    }


    const result =
        await supabaseClient
            .storage
            .from("movie-posters")
            .createSignedUrl(
                filePath,
                3600
            );


    if (result.error) {

        console.error(
            "ポスターURL取得エラー:",
            result.error
        );

        return "";

    }


    return result.data
        ? result.data.signedUrl
        : "";

}


// ==================================================
// 映画一覧表示
// ==================================================

async function displayMovies(movieList) {

    const sortedMovies =
        sortMovieList(movieList);


    const container =
        document.getElementById(
            "movieContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const movieCount =
        document.getElementById(
            "movieCount"
        );


    if (movieCount) {

        movieCount.textContent =
            sortedMovies.length +
            "作品";

    }


    if (sortedMovies.length === 0) {

        container.innerHTML =
            "<p>該当する映画がありません。</p>";

        return;

    }


    for (const movie of sortedMovies) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "movie-card";


        // ------------------------------------------
        // ポスター
        // ------------------------------------------

        let detailPosterUrl = "";


        if (movie.poster) {

            detailPosterUrl =
                await getPosterUrl(
                    movie.poster
                );

        }


        let posterHTML = "";


        if (detailPosterUrl) {

            posterHTML =
                '<img src="' +
                escapeHTML(detailPosterUrl) +
                '" class="detail-poster">';

        } else {

            posterHTML =
                '<div class="detail-poster"></div>';

        }


        // ------------------------------------------
        // 評価
        // ------------------------------------------

        let stars = "";


        if (movie.rating) {

            stars =
                "★".repeat(
                    Number(movie.rating)
                );

        }


        // ------------------------------------------
        // カード
        // ------------------------------------------

        card.innerHTML =

            posterHTML +

            '<div class="movie-card-content">' +

                "<h3>" +
                    escapeHTML(movie.title) +
                "</h3>" +

                '<div class="movie-info">' +

                    "監督：" +
                    escapeHTML(
                        movie.director ||
                        "未登録"
                    ) +

                    "<br>" +

                    "公開年：" +
                    escapeHTML(
                        movie.year ||
                        "未登録"
                    ) +

                    "<br>" +

                    "制作国：" +
                    escapeHTML(
                        movie.country ||
                        "未登録"
                    ) +

                "</div>" +

                '<div class="movie-rating">' +
                    stars +
                "</div>" +

            "</div>";


        card.addEventListener(
            "click",
            function () {

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


// ==================================================
// 映画詳細
// ==================================================

async function openMovieDetail(id) {

    const movie =
        movies.find(
            function (item) {

                return String(item.id) === String(id);

            }
        );


    if (!movie) {

        return;

    }


    const detail =
        document.getElementById(
            "movieDetail"
        );


    if (!detail) {

        return;

    }


    let detailPosterUrl = "";


    if (movie.poster) {

        detailPosterUrl =
            await getPosterUrl(
                movie.poster
            );

    }


    let posterHTML = "";


    if (detailPosterUrl) {

        posterHTML =
            '<img src="' +
            escapeHTML(detailPosterUrl) +
            '" class="detail-poster">';

    } else {

        posterHTML =
            '<div class="detail-poster"></div>';

    }


    let stars = "評価なし";


    if (movie.rating) {

        stars =
            "★".repeat(
                Number(movie.rating)
            );

    }


    detail.innerHTML =

        '<div class="detail-layout">' +

            posterHTML +

            '<div class="detail-info">' +

                "<h2>" +
                    escapeHTML(movie.title) +
                "</h2>" +

                "<p>" +
                    "<strong>監督：</strong>" +
                    escapeHTML(
                        movie.director ||
                        "未登録"
                    ) +
                "</p>" +

                "<p>" +
                    "<strong>公開年：</strong>" +
                    escapeHTML(
                        movie.year ||
                        "未登録"
                    ) +
                "</p>" +

                "<p>" +
                    "<strong>制作国：</strong>" +
                    escapeHTML(
                        movie.country ||
                        "未登録"
                    ) +
                "</p>" +

                "<p>" +
                    "<strong>ジャンル：</strong>" +
                    escapeHTML(
                        movie.genre ||
                        "未登録"
                    ) +
                "</p>" +

                "<p>" +
                    "<strong>出演者：</strong>" +
                    escapeHTML(
                        movie.cast ||
                        "未登録"
                    ) +
                "</p>" +

                "<p>" +
                    "<strong>タグ：</strong>" +
                    escapeHTML(
                        movie.tags ||
                        "なし"
                    ) +
                "</p>" +

                "<p>" +
                    "<strong>鑑賞日：</strong>" +
                    escapeHTML(
                        movie.date ||
                        "未登録"
                    ) +
                "</p>" +

                "<p>" +
                    "<strong>評価：</strong>" +
                    stars +
                "</p>" +

            "</div>" +

        "</div>" +

        '<div class="detail-memo">' +

            "<h3>感想・メモ</h3>" +

            escapeHTML(
                movie.memo ||
                "メモはありません。"
            ) +

        "</div>" +

        '<button class="edit-button" ' +
            'onclick="openEditModal(' +
            "'" + String(movie.id) + "'" +
            ')">' +
            "編集" +
        "</button>" +

        '<button class="delete-button" ' +
            'onclick="deleteMovie(' +
            "'" + String(movie.id) + "'" +
            ')">' +
            "削除" +
        "</button>";


    const modal =
        document.getElementById(
            "movieModal"
        );


    if (modal) {

        modal.style.display =
            "block";

    }

}


// ==================================================
// 詳細画面を閉じる
// ==================================================

function closeMovieModal() {

    const modal =
        document.getElementById(
            "movieModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ==================================================
// 編集画面
// ==================================================

function openEditModal(id) {

    const movie =
        movies.find(
            function (item) {

                return String(item.id) === String(id);

            }
        );


    if (!movie) {

        return;

    }


    editingMovieId =
        movie.id;


    const fields = {

        editTitle:
            movie.title || "",

        editDirector:
            movie.director || "",

        editYear:
            movie.year || "",

        editCountry:
            movie.country || "",

        editDate:
            movie.date || "",

        editRating:
            movie.rating || "",

        editGenre:
            movie.genre || "",

        editCast:
            movie.cast || "",

        editTags:
            movie.tags || "",

        editMemo:
            movie.memo || "",

        editPoster:
            ""

    };


    Object.keys(fields).forEach(
        function (id) {

            const element =
                document.getElementById(id);

            if (element) {

                element.value =
                    fields[id];

            }

        }
    );


    const modal =
        document.getElementById(
            "editModal"
        );


    if (modal) {

        modal.style.display =
            "block";

    }

}


// ==================================================
// 編集保存
// ==================================================

async function saveEdit() {

    if (editingMovieId === null) {

        return;

    }


    const getValue =
        function (id) {

            const element =
                document.getElementById(id);

            if (!element) {

                return "";

            }

            return element.value.trim();

        };


    const title =
        getValue("editTitle");


    if (!title) {

        alert(
            "作品名を入力してください。"
        );

        return;

    }


    const director =
        getValue("editDirector");

    const yearElement =
        document.getElementById("editYear");

    const year =
        yearElement
            ? yearElement.value
            : "";

    const country =
        getValue("editCountry");

    const dateElement =
        document.getElementById("editDate");

    const dateValue =
        dateElement
            ? dateElement.value
            : "";

    const date =
        dateValue === ""
            ? null
            : dateValue;

    const ratingElement =
        document.getElementById("editRating");

    const ratingValue =
        ratingElement
            ? ratingElement.value
            : "";

    const rating =
        ratingValue === ""
            ? null
            : Number(ratingValue);

    const genre =
        getValue("editGenre");

    const cast =
        getValue("editCast");

    const tags =
        getValue("editTags");

    const memo =
        getValue("editMemo");


    const posterElement =
        document.getElementById(
            "editPoster"
        );


    const posterFile =
        posterElement &&
        posterElement.files
            ? posterElement.files[0]
            : null;


    let poster = null;


    // ------------------------------------------
    // 新しいポスター
    // ------------------------------------------

    if (posterFile) {

        try {

            poster =
                await uploadPoster(
                    posterFile
                );

        } catch (error) {

            console.error(error);

            alert(
                "ポスター画像をアップロードできませんでした。"
            );

            return;

        }

    }


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


    // ------------------------------------------
    // ポスターを変更した場合
    // ------------------------------------------

    if (posterFile) {

        const oldMovie =
            movies.find(
                function (movie) {

                    return String(movie.id) ===
                        String(editingMovieId);

                }
            );


        if (
            oldMovie &&
            oldMovie.poster
        ) {

            try {

                let oldFilePath =
                    oldMovie.poster;


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
                                    index + pathPrefix.length
                                )
                            );

                    }

                }


                const deleteResult =
                    await supabaseClient
                        .storage
                        .from("movie-posters")
                        .remove([
                            oldFilePath
                        ]);


                if (deleteResult.error) {

                    console.error(
                        "古いポスター削除エラー:",
                        deleteResult.error
                    );

                }

            } catch (error) {

                console.error(
                    "古いポスター削除処理エラー:",
                    error
                );

            }

        }


        updateData.poster =
            poster;

    }


    // ------------------------------------------
    // Supabase更新
    // ------------------------------------------

    const result =
        await supabaseClient
            .from("movies")
            .update(updateData)
            .eq(
                "id",
                editingMovieId
            )
            .select()
            .single();


    if (result.error) {

        console.error(
            "映画編集エラー:",
            result.error
        );

        alert(
            "変更を保存できませんでした。\n\n" +
            result.error.message
        );

        return;

    }


    const index =
        movies.findIndex(
            function (movie) {

                return String(movie.id) ===
                    String(editingMovieId);

            }
        );


    if (index !== -1) {

        movies[index] =
            result.data;

    }


    updateFilters();

    displayMovies(movies);

    updateStatistics();

    closeEditModal();

    closeMovieModal();


    alert(
        "変更を保存しました！"
    );

}


// ==================================================
// 編集画面を閉じる
// ==================================================

function closeEditModal() {

    const modal =
        document.getElementById(
            "editModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ==================================================
// 映画削除
// ==================================================

async function deleteMovie(id) {

    if (
        !confirm(
            "この映画を削除しますか？"
        )
    ) {

        return;

    }


    const movie =
        movies.find(
            function (item) {

                return String(item.id) === String(id);

            }
        );


    if (!movie) {

        return;

    }


    // ------------------------------------------
    // ポスター削除
    // ------------------------------------------

    if (movie.poster) {

        try {

            let filePath =
                movie.poster;


            if (
                movie.poster.startsWith("http://") ||
                movie.poster.startsWith("https://")
            ) {

                const posterUrl =
                    new URL(
                        movie.poster
                    );

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
                                index + pathPrefix.length
                            )
                        );

                }

            }


            const storageResult =
                await supabaseClient
                    .storage
                    .from("movie-posters")
                    .remove([
                        filePath
                    ]);


            if (storageResult.error) {

                console.error(
                    "ポスター削除エラー:",
                    storageResult.error
                );

            }

        } catch (error) {

            console.error(
                "ポスター削除処理エラー:",
                error
            );

        }

    }


    // ------------------------------------------
    // moviesテーブルから削除
    // ------------------------------------------

    const result =
        await supabaseClient
            .from("movies")
            .delete()
            .eq(
                "id",
                id
            );


    if (result.error) {

        console.error(
            "映画削除エラー:",
            result.error
        );

        alert(
            "映画を削除できませんでした。\n\n" +
            result.error.message
        );

        return;

    }


    movies =
        movies.filter(
            function (movie) {

                return String(movie.id) !== String(id);

            }
        );


    updateFilters();

    displayMovies(movies);

    updateStatistics();

    closeMovieModal();


    alert(
        "映画を削除しました！"
    );

}


// ==================================================
// 映画検索
// ==================================================

function searchMovies() {

    const titleElement =
        document.getElementById(
            "searchTitle"
        );

    const directorElement =
        document.getElementById(
            "searchDirector"
        );

    const countryElement =
        document.getElementById(
            "searchCountry"
        );

    const yearFromElement =
        document.getElementById(
            "searchYearFrom"
        );

    const yearToElement =
        document.getElementById(
            "searchYearTo"
        );

    const genreElement =
        document.getElementById(
            "searchGenre"
        );

    const tagElement =
        document.getElementById(
            "searchTag"
        );


    const titleKeyword =
        titleElement
            ? titleElement.value.trim().toLowerCase()
            : "";

    const director =
        directorElement
            ? directorElement.value
            : "";

    const country =
        countryElement
            ? countryElement.value
            : "";

    const yearFromValue =
        yearFromElement
            ? yearFromElement.value
            : "";

    const yearToValue =
        yearToElement
            ? yearToElement.value
            : "";

    const yearFrom =
        yearFromValue === ""
            ? null
            : Number(yearFromValue);

    const yearTo =
        yearToValue === ""
            ? null
            : Number(yearToValue);

    const genre =
        genreElement
            ? genreElement.value
            : "";

    const tag =
        tagElement
            ? tagElement.value
            : "";


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
        movies.filter(
            function (movie) {

                const movieTitle =
                    String(
                        movie.title || ""
                    ).toLowerCase();

                const movieDirector =
                    String(
                        movie.director || ""
                    ).toLowerCase();


                const titleMatch =
                    titleKeyword === "" ||
                    movieTitle.includes(titleKeyword) ||
                    movieDirector.includes(titleKeyword);


                const directorMatch =
                    director === "" ||
                    movie.director === director;


                const countryMatch =
                    country === "" ||
                    movie.country === country;


                const movieYear =
                    Number(movie.year);


                let yearMatch = true;


                if (
                    yearFrom !== null ||
                    yearTo !== null
                ) {

                    if (
                        !movie.year ||
                        isNaN(movieYear)
                    ) {

                        yearMatch = false;

                    } else {

                        if (
                            yearFrom !== null &&
                            movieYear < yearFrom
                        ) {

                            yearMatch = false;

                        }

                        if (
                            yearTo !== null &&
                            movieYear > yearTo
                        ) {

                            yearMatch = false;

                        }

                    }

                }


                const movieGenres =
                    String(
                        movie.genre || ""
                    )
                        .split(",")
                        .map(
                            function (item) {

                                return item.trim();

                            }
                        );


                const genreMatch =
                    genre === "" ||
                    movieGenres.includes(genre);


                const movieTags =
                    String(
                        movie.tags || ""
                    )
                        .split(",")
                        .map(
                            function (item) {

                                return item.trim();

                            }
                        );


                const tagMatch =
                    tag === "" ||
                    movieTags.includes(tag);


                return (
                    titleMatch &&
                    directorMatch &&
                    countryMatch &&
                    yearMatch &&
                    genreMatch &&
                    tagMatch
                );

            }
        );


    displayMovies(results);

}


// ==================================================
// 検索リセット
// ==================================================

function resetSearch() {

    const ids = [

        "searchTitle",
        "searchDirector",
        "searchCountry",
        "searchYearFrom",
        "searchYearTo",
        "searchGenre",
        "searchTag"

    ];


    ids.forEach(function (id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.value = "";

        }

    });


    displayMovies(movies);

}


// ==================================================
// 検索項目更新
// ==================================================

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


    if (
        !directorSelect ||
        !countrySelect ||
        !genreSelect ||
        !tagSelect
    ) {

        return;

    }


    // ------------------------------------------
    // 監督
    // ------------------------------------------

    const directors =
        [
            ...new Set(
                movies
                    .map(
                        function (movie) {

                            return movie.director;

                        }
                    )
                    .filter(Boolean)
            )
        ].sort();


    directorSelect.innerHTML =
        '<option value="">すべて</option>';


    directors.forEach(
        function (director) {

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

        }
    );


    // ------------------------------------------
    // 制作国
    // ------------------------------------------

    const countries =
        [
            ...new Set(
                movies
                    .map(
                        function (movie) {

                            return movie.country;

                        }
                    )
                    .filter(Boolean)
            )
        ].sort();


    countrySelect.innerHTML =
        '<option value="">すべて</option>';


    countries.forEach(
        function (country) {

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

        }
    );


    // ------------------------------------------
    // ジャンル
    // ------------------------------------------

    const genres =
        [
            ...new Set(

                movies

                    .flatMap(
                        function (movie) {

                            return String(
                                movie.genre || ""
                            ).split(",");

                        }
                    )

                    .map(
                        function (genre) {

                            return genre.trim();

                        }
                    )

                    .filter(Boolean)

            )
        ].sort();


    genreSelect.innerHTML =
        '<option value="">すべて</option>';


    genres.forEach(
        function (genre) {

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

        }
    );


    // ------------------------------------------
    // タグ
    // ------------------------------------------

    const tags =
        [
            ...new Set(

                movies

                    .flatMap(
                        function (movie) {

                            return String(
                                movie.tags || ""
                            ).split(",");

                        }
                    )

                    .map(
                        function (tag) {

                            return tag.trim();

                        }
                    )

                    .filter(Boolean)

            )
        ].sort();


    tagSelect.innerHTML =
        '<option value="">すべて</option>';


    tags.forEach(
        function (tag) {

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

        }
    );

}


// ==================================================
// HTMLを安全に表示
// ==================================================

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
// 統計
// ==================================================

function countMoviesBy(items) {

    const counts = {};


    items.forEach(
        function (item) {

            if (!item) {

                return;

            }


            counts[item] =
                (counts[item] || 0) + 1;

        }
    );


    return counts;

}


// ==================================================
// 年代取得
// ==================================================

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


// ==================================================
// 統計グラフ更新
// ==================================================

function updateStatistics() {

    if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.jsが読み込まれていません。"
        );

        return;

    }


    // ------------------------------------------
    // 監督
    // ------------------------------------------

    const directorCounts =
        countMoviesBy(
            movies.map(
                function (movie) {

                    return movie.director;

                }
            )
        );


    // ------------------------------------------
    // 制作国
    // ------------------------------------------

    const countryCounts =
        countMoviesBy(
            movies.map(
                function (movie) {

                    return movie.country;

                }
            )
        );


    // ------------------------------------------
    // 公開年代
    // ------------------------------------------

    const decades =
        movies

            .map(
                function (movie) {

                    return getDecade(
                        movie.year
                    );

                }
            )

            .filter(
                function (decade) {

                    return decade !== null;

                }
            );


    const decadeCounts =
        countMoviesBy(
            decades
        );


    // ------------------------------------------
    // 監督グラフ
    // ------------------------------------------

    const directorCanvas =
        document.getElementById(
            "directorChart"
        );


    if (directorCanvas) {

        if (directorChart) {

            directorChart.destroy();

        }


        directorChart =
            new Chart(
                directorCanvas,
                {

                    type: "bar",

                    data: {

                        labels:
                            Object.keys(
                                directorCounts
                            ),

                        datasets: [

                            {

                                label:
                                    "鑑賞本数",

                                data:
                                    Object.values(
                                        directorCounts
                                    )

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


    // ------------------------------------------
    // 制作国グラフ
    // ------------------------------------------

    const countryCanvas =
        document.getElementById(
            "countryChart"
        );


    if (countryCanvas) {

        if (countryChart) {

            countryChart.destroy();

        }


        countryChart =
            new Chart(
                countryCanvas,
                {

                    type: "bar",

                    data: {

                        labels:
                            Object.keys(
                                countryCounts
                            ),

                        datasets: [

                            {

                                label:
                                    "鑑賞本数",

                                data:
                                    Object.values(
                                        countryCounts
                                    )

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


    // ------------------------------------------
    // 公開年代グラフ
    // ------------------------------------------

    const decadeCanvas =
        document.getElementById(
            "yearChart"
        );


    if (decadeCanvas) {

        if (decadeChart) {

            decadeChart.destroy();

        }


        const sortedDecades =
            Object.keys(
                decadeCounts
            )
                .map(Number)
                .sort(
                    function (a, b) {

                        return a - b;

                    }
                );


        const decadeLabels =
            sortedDecades.map(
                function (decade) {

                    return decade + "年代";

                }
            );


        const decadeData =
            sortedDecades.map(
                function (decade) {

                    return decadeCounts[decade];

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

}


// ==================================================
// ログイン
// ==================================================

async function login() {

    const emailElement =
        document.getElementById(
            "loginEmail"
        );

    const passwordElement =
        document.getElementById(
            "loginPassword"
        );

    const errorElement =
        document.getElementById(
            "loginError"
        );


    if (!emailElement || !passwordElement) {

        console.error(
            "ログインフォームが見つかりません。"
        );

        return;

    }


    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;


    if (errorElement) {

        errorElement.textContent = "";

    }


    if (!email || !password) {

        if (errorElement) {

            errorElement.textContent =
                "メールアドレスとパスワードを入力してください。";

        }

        return;

    }


    const result =
        await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password

            });


    if (result.error) {

        console.error(
            "ログインエラー:",
            result.error
        );


        if (errorElement) {

            errorElement.textContent =
                "ログインできませんでした。メールアドレスとパスワードを確認してください。";

        }

        return;

    }


    console.log(
        "ログイン成功:",
        result.data.user
    );


    showApp();


    await loadMovies();

}


// ==================================================
// ログアウト
// ==================================================

async function logout() {

    const result =
        await supabaseClient.auth
            .signOut();


    if (result.error) {

        console.error(
            "ログアウトエラー:",
            result.error
        );

        alert(
            "ログアウトできませんでした。"
        );

        return;

    }


    hideApp();

}


// ==================================================
// アプリ表示
// ==================================================

function showApp() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const appContent =
        document.getElementById(
            "appContent"
        );


    if (loginScreen) {

        loginScreen.style.display =
            "none";

    }


    if (appContent) {

        appContent.style.display =
            "block";

    }

}


// ==================================================
// ログイン画面表示
// ==================================================

function hideApp() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const appContent =
        document.getElementById(
            "appContent"
        );


    if (appContent) {

        appContent.style.display =
            "none";

    }


    if (loginScreen) {

        loginScreen.style.display =
            "block";

    }

}


// ==================================================
// ログイン状態確認
// ==================================================

async function checkLogin() {

    const result =
        await supabaseClient.auth
            .getSession();


    if (result.error) {

        console.error(
            "ログイン状態確認エラー:",
            result.error
        );

        hideApp();

        return;

    }


    if (result.data.session) {

        showApp();

        await loadMovies();

    } else {

        hideApp();

    }

}


// ==================================================
// Supabaseから映画を取得
// ==================================================

async function loadMovies() {

    const result =
        await supabaseClient
            .from("movies")
            .select("*")
            .order(
                "id",
                {
                    ascending: false
                }
            );


    if (result.error) {

        console.error(
            "映画データ取得エラー:",
            result.error
        );

        alert(
            "映画データを取得できませんでした。\n\n" +
            result.error.message
        );

        return;

    }


    movies =
        result.data || [];


    updateFilters();

    displayMovies(movies);

    updateStatistics();

}


// ==================================================
// Supabase認証状態の変更を監視
// ==================================================

supabaseClient.auth.onAuthStateChange(
    function (event, session) {

        console.log(
            "認証状態変更:",
            event
        );


        if (session) {

            showApp();

        } else {

            hideApp();

        }

    }
);


// ==================================================
// HTMLのonclickから呼び出せるようにする
// ==================================================

window.login =
    login;

window.logout =
    logout;

window.addMovie =
    addMovie;

window.openMovieDetail =
    openMovieDetail;

window.closeMovieModal =
    closeMovieModal;

window.openEditModal =
    openEditModal;

window.saveEdit =
    saveEdit;

window.closeEditModal =
    closeEditModal;

window.deleteMovie =
    deleteMovie;

window.searchMovies =
    searchMovies;

window.resetSearch =
    resetSearch;

window.changeSort =
    changeSort;

window.checkLogin =
    checkLogin;


// ==================================================
// Supabase接続確認
// ==================================================

console.log(
    "Supabase接続準備完了",
    supabaseClient
);


// ==================================================
// アプリ起動
// ==================================================

checkLogin();