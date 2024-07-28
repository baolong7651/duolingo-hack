try {
    process.env.LESSONS = process.env.LESSONS ?? 1;

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DUOLINGO_JWT}`,
        "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, như Gecko) Chrome/121.0.0.0 Safari/537.36",
    };

    const { sub } = JSON.parse(
        Buffer.from(process.env.DUOLINGO_JWT.split(".")[1], "base64").toString(),
    );

    const { fromLanguage, learningLanguage } = await fetch(
        `https://www.duolingo.com/2017-06-30/users/${sub}?fields=fromLanguage,learningLanguage`,
        {
            headers,
        },
    ).then((response) => response.json());

    let xp = 0;

    // Function to complete a single lesson
    const completeLesson = async () => {
        const session = await fetch(
            "https://www.duolingo.com/2017-06-30/sessions",
            {
                body: JSON.stringify({
                    challengeTypes: [
                        "assist",
                        "characterIntro",
                        "characterMatch",
                        "characterPuzzle",
                        "characterSelect",
                        "characterTrace",
                        "characterWrite",
                        "completeReverseTranslation",
                        "definition",
                        "dialogue",
                        "extendedMatch",
                        "extendedListenMatch",
                        "form",
                        "freeResponse",
                        "gapFill",
                        "judge",
                        "listen",
                        "listenComplete",
                        "listenMatch",
                        "match",
                        "name",
                        "listenComprehension",
                        "listenIsolation",
                        "listenSpeak",
                        "listenTap",
                        "orderTapComplete",
                        "partialListen",
                        "partialReverseTranslate",
                        "patternTapComplete",
                        "radioBinary",
                        "radioImageSelect",
                        "radioListenMatch",
                        "radioListenRecognize",
                        "radioSelect",
                        "readComprehension",
                        "reverseAssist",
                        "sameDifferent",
                        "select",
                        "selectPronunciation",
                        "selectTranscription",
                        "svgPuzzle",
                        "syllableTap",
                        "syllableListenTap",
                        "speak",
                        "tapCloze",
                        "tapClozeTable",
                        "tapComplete",
                        "tapCompleteTable",
                        "tapDescribe",
                        "translate",
                        "transliterate",
                        "transliterationAssist",
                        "typeCloze",
                        "typeClozeTable",
                        "typeComplete",
                        "typeCompleteTable",
                        "writeComprehension",
                    ],
                    fromLanguage,
                    isFinalLevel: false,
                    isV2: true,
                    juicy: true,
                    learningLanguage,
                    smartTipsVersion: 2,
                    type: "GLOBAL_PRACTICE",
                }),
                headers,
                method: "POST",
            },
        ).then((response) => response.json());

        const response = await fetch(
            `https://www.duolingo.com/2017-06-30/sessions/${session.id}`,
            {
                body: JSON.stringify({
                    ...session,
                    heartsLeft: 0,
                    startTime: (+new Date() - 1000) / 1000, // Giả lập thời gian bắt đầu cách đây 1 giây
                    enableBonusPoints: false,
                    endTime: +new Date() / 1000, // Kết thúc ngay bây giờ
                    failed: false,
                    maxInLessonStreak: 9,
                    shouldLearnThings: true,
                }),
                headers,
                method: "PUT",
            },
        ).then((response) => response.json());

        return response.xpGain;
    };

    // Sử dụng Promise.all để gửi yêu cầu đồng thời
    const lessonPromises = Array.from({ length: process.env.LESSONS }, completeLesson);
    const xpResults = await Promise.all(lessonPromises);

    // Tính tổng XP
    xp = xpResults.reduce((total, xpGain) => total + xpGain, 0);

    console.log(`🎉 You won ${xp} XP`);
} catch (error) {
    console.log("❌ Something went wrong");
    if (error instanceof Error) {
        console.log(error.message);
    }
}
