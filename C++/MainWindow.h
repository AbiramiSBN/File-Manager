#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QFileSystemModel>
#include <QListView>
#include <QLineEdit>
#include <QToolBar>
#include <QAction>

class MainWindow : public QMainWindow {
    Q_OBJECT
public:
    explicit MainWindow(QWidget *parent = nullptr);

private slots:
    void onItemActivated(const QModelIndex &index);
    void onBack();

private:
    QFileSystemModel *model;
    QListView *view;
    QLineEdit *pathEdit;
    QAction *backAction;
    QStringList history;
    void navigateTo(const QString &path);
};

#endif // MAINWINDOW_H