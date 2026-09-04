FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates
# تحميل النسخة الرسمية من موقع PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.20/pocketbase_0.22.20_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/
EXPOSE 8080
# تشغيل السيرفر
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]